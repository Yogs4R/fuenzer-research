package handlers

import (
	"strings"
	"time"

	"fuenzer-research/backend/internal/models"
	"fuenzer-research/backend/internal/services/gemini"
	"fuenzer-research/backend/internal/services/scholar"
	"fuenzer-research/backend/internal/services/sinta"

	"github.com/gofiber/fiber/v2"
)

// ResearchHandler holds dependencies for the research endpoint.
type ResearchHandler struct {
	scholarClient *scholar.Client
	geminiClient  *gemini.Client
	sintaMapper   *sinta.Mapper
}

// NewResearchHandler creates a new handler with all service dependencies.
func NewResearchHandler(sc *scholar.Client, gc *gemini.Client, sm *sinta.Mapper) *ResearchHandler {
	return &ResearchHandler{
		scholarClient: sc,
		geminiClient:  gc,
		sintaMapper:   sm,
	}
}

// Handle processes POST /api/v1/research requests.
// Orchestration: Scholar → SINTA Mapping → Gemini Synthesis
func (h *ResearchHandler) Handle(c *fiber.Ctx) error {
	start := time.Now()

	var req models.ResearchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Input validation per security-policy.md
	req.Query = strings.TrimSpace(req.Query)
	if len(req.Query) < 3 || len(req.Query) > 200 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Mohon masukkan kata kunci riset akademis yang valid (3-200 karakter).",
		})
	}

	if req.Scope == "" {
		req.Scope = "global"
	}

	if req.Scope != "global" && req.Scope != "indonesia" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Scope must be 'global' or 'indonesia'.",
		})
	}

	// Step 1: Fetch papers from Semantic Scholar
	papers, err := h.scholarClient.Search(req.Query, req.Scope)
	if err != nil {
		// Timeout or API failure — return 504
		return c.Status(fiber.StatusGatewayTimeout).JSON(fiber.Map{
			"error": "Database timeout. Please try again.",
		})
	}

	// Short-circuit: empty results — do NOT call Gemini
	if len(papers) == 0 {
		return c.Status(fiber.StatusOK).JSON(models.ResearchResponse{
			Synthesis:  "Tidak ditemukan literatur yang relevan untuk topik ini.",
			References: []models.AcademicSource{},
			LatencyMs:  time.Since(start).Milliseconds(),
		})
	}

	// Step 2: Convert ScholarPaper → AcademicSource
	sources := make([]models.AcademicSource, 0, len(papers))
	for _, p := range papers {
		publisher := p.Venue
		if p.Journal != nil && p.Journal.Name != "" {
			publisher = p.Journal.Name
		}

		authors := make([]string, 0, len(p.Authors))
		for _, a := range p.Authors {
			authors = append(authors, a.Name)
		}

		source := models.AcademicSource{
			ID:        p.PaperId,
			Title:     p.Title,
			Authors:   authors,
			Year:      p.Year,
			Publisher: publisher,
			Abstract:  p.Abstract,
			URL:       p.URL,
			Indexes:   []models.IndexEntry{},
		}

		// Build DOI URL if available
		if p.ExternalIds != nil {
			if doi, ok := p.ExternalIds["DOI"]; ok {
				if doiStr, ok := doi.(string); ok && doiStr != "" {
					source.URL = "https://doi.org/" + doiStr
				}
			}
		}

		sources = append(sources, source)
	}

	// Step 3: SINTA Dictionary Mapping (only for indonesia scope)
	if req.Scope == "indonesia" {
		sources = h.sintaMapper.MapPapers(sources)
	}

	// Step 4: AI Synthesis via Gemini
	synthesis, err := h.geminiClient.Synthesize(req.Query, sources)
	if err != nil {
		// Gemini failed — still return references without synthesis
		synthesis = "Sintesis AI sedang tidak tersedia. Silakan lihat referensi di bawah."
	}

	// Strip abstracts from response (frontend doesn't need them)
	for i := range sources {
		sources[i].Abstract = ""
	}

	return c.Status(fiber.StatusOK).JSON(models.ResearchResponse{
		Synthesis:  synthesis,
		References: sources,
		LatencyMs:  time.Since(start).Milliseconds(),
	})
}
