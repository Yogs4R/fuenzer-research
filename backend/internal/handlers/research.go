package handlers

import (
	"strings"
	"time"

	"fuenzer-research/backend/internal/models"
	"fuenzer-research/backend/internal/services/gemini"
	"fuenzer-research/backend/internal/services/openalex"
	"fuenzer-research/backend/internal/services/sinta"

	"github.com/gofiber/fiber/v2"
)

// ResearchHandler holds dependencies for the research endpoint.
type ResearchHandler struct {
	openalexClient *openalex.Client
	geminiClient   *gemini.Client
	sintaMapper    *sinta.Mapper
}

// NewResearchHandler creates a new handler with all service dependencies.
func NewResearchHandler(oc *openalex.Client, gc *gemini.Client, sm *sinta.Mapper) *ResearchHandler {
	return &ResearchHandler{
		openalexClient: oc,
		geminiClient:   gc,
		sintaMapper:    sm,
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

	// Step 1: Fetch works from OpenAlex
	papers, err := h.openalexClient.Search(req.Query, req.Scope)
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

	// Step 2: Convert OpenAlexWork → AcademicSource
	sources := make([]models.AcademicSource, 0, len(papers))
	for _, p := range papers {
		publisher := "OpenAlex Resource"
		url := p.ID // default URL
		if p.PrimaryLocation != nil {
			if p.PrimaryLocation.Source != nil && p.PrimaryLocation.Source.DisplayName != "" {
				publisher = p.PrimaryLocation.Source.DisplayName
			}
			if p.PrimaryLocation.LandingPageURL != "" {
				url = p.PrimaryLocation.LandingPageURL
			}
		}

		authors := make([]string, 0, len(p.Authorships))
		for _, a := range p.Authorships {
			authors = append(authors, a.Author.DisplayName)
		}

		// Decode the abstract from inverted index
		abstract := openalex.DecodeAbstract(p.AbstractInvertedIndex)

		source := models.AcademicSource{
			ID:        p.ID,
			Title:     p.Title,
			Authors:   authors,
			Year:      p.PublicationYear,
			Publisher: publisher,
			Abstract:  abstract,
			URL:       url,
			Indexes:   []models.IndexEntry{},
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
