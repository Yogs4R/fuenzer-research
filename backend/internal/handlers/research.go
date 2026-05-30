package handlers

import (
	"log"
	"strings"
	"time"

	"fuenzer-research/backend/internal/models"
	"fuenzer-research/backend/internal/services/garuda"
	"fuenzer-research/backend/internal/services/gemini"
	"fuenzer-research/backend/internal/services/googlebooks"
	"fuenzer-research/backend/internal/services/openalex"
	"fuenzer-research/backend/internal/services/sinta"

	"github.com/gofiber/fiber/v2"
)

// ResearchHandler holds dependencies for the research endpoint.
type ResearchHandler struct {
	openalexClient    *openalex.Client
	geminiClient      *gemini.Client
	sintaMapper       *sinta.Mapper
	garudaClient      *garuda.Client
	googleBooksClient *googlebooks.Client
}

// NewResearchHandler creates a new handler with all service dependencies.
func NewResearchHandler(
	oc *openalex.Client,
	gc *gemini.Client,
	sm *sinta.Mapper,
	gcLocal *garuda.Client,
	gbc *googlebooks.Client,
) *ResearchHandler {
	return &ResearchHandler{
		openalexClient:    oc,
		geminiClient:      gc,
		sintaMapper:       sm,
		garudaClient:      gcLocal,
		googleBooksClient: gbc,
	}
}

// Handle processes POST /api/v1/research requests.
// Orchestration: Scholar → SINTA Mapping → Gemini Synthesis
func (h *ResearchHandler) Handle(c *fiber.Ctx) error {
	start := time.Now()

	var req models.ResearchRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("ERROR: BodyParser failed: %v", err)
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

	// Validate type filter (optional)
	validTypes := map[string]bool{"": true, "article": true, "book": true, "journal": true}
	if !validTypes[req.Type] {
		req.Type = ""
	}

	var sources []models.AcademicSource
	var err error

	limit := 5
	if req.Type == "" {
		limit = 15
	}

	// Route based on Type and Index
	if req.Index == "GARUDA" {
		sources, err = h.garudaClient.Search(req.Query, req.Type)
		if err != nil {
			log.Printf("ERROR: Garuda SQLite search failed: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Query database lokal gagal.",
			})
		}
	} else if req.Index == "SINTA" {
		switch req.Type {
		case "journal":
			sources = h.sintaMapper.SearchJournals(req.Query, req.SintaRank, limit)
		case "article":
			sources = h.sintaMapper.SearchArticles(req.Query, req.SintaRank, limit)
		default:
			// All: combine journals and articles
			journals := h.sintaMapper.SearchJournals(req.Query, req.SintaRank, limit)
			articles := h.sintaMapper.SearchArticles(req.Query, req.SintaRank, limit)
			sources = append(journals, articles...)
			if len(sources) > limit {
				sources = sources[:limit]
			}
		}
	} else if req.Type == "journal" {
		sources, err = h.openalexClient.SearchSources(req.Query, req.Scope, limit)
		if err != nil {
			log.Printf("ERROR: OpenAlex Sources search failed: %v", err)
			return c.Status(fiber.StatusGatewayTimeout).JSON(fiber.Map{
				"error": "Database timeout. Please try again.",
			})
		}
	} else if (req.Type == "book" && req.Index == "Google Books") || (req.Index == "Google Books" && req.Type == "") {
		// Use Google Books client for book searches
		sources, err = h.googleBooksClient.Search(req.Query, req.Scope, limit)
		if err != nil {
			log.Printf("ERROR: Google Books search failed: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Pencarian Google Books gagal. Silakan coba lagi.",
			})
		}
	} else {
		// Default Works search (Articles/All) via OpenAlex
		papers, err := h.openalexClient.Search(req.Query, req.Scope, req.Type)
		if err != nil {
			return c.Status(fiber.StatusGatewayTimeout).JSON(fiber.Map{
				"error": "Database timeout. Please try again.",
			})
		}

		// Convert OpenAlexWork → AcademicSource
		sources = make([]models.AcademicSource, 0, len(papers))
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

			abstract := openalex.DecodeAbstract(p.AbstractInvertedIndex)

			contentType := p.Type
			// If p.Type is article and published in journal, label as "journal-article" only for combined (type == "")
			// This ensures user requested "article" remains categorized under "article" in the frontend.
			if p.Type == "article" {
				if req.Type == "" && p.PrimaryLocation != nil && p.PrimaryLocation.Source != nil && p.PrimaryLocation.Source.Type == "journal" {
					contentType = "journal-article"
				} else {
					contentType = "article"
				}
			}

			source := models.AcademicSource{
				ID:          p.ID,
				Title:       p.Title,
				Authors:     authors,
				Year:        p.PublicationYear,
				Publisher:   publisher,
				Abstract:    abstract,
				URL:         url,
				Indexes:     []models.IndexEntry{},
				ContentType: contentType,
			}
			if req.Scope == "indonesia" {
				source.Indexes = append(source.Indexes, models.IndexEntry{Provider: "location", Tier: "Indonesia"})
			}

			sources = append(sources, source)
		}

		// Map SINTA dictionary (only for indonesia scope or if SINTA is requested)
		if req.Scope == "indonesia" || req.Index == "SINTA" {
			sources = h.sintaMapper.MapPapers(sources)
		}

		// Apply SINTA specific rank filtering
		if req.Index == "SINTA" {
			var filteredSources []models.AcademicSource
			for _, src := range sources {
				isSintaMatch := false
				matchedTier := ""
				for _, idx := range src.Indexes {
					if strings.ToLower(idx.Provider) == "sinta" {
						isSintaMatch = true
						matchedTier = idx.Tier
						break
					}
				}
				if isSintaMatch {
					if len(req.SintaRank) == 0 || containsAll(req.SintaRank) {
						filteredSources = append(filteredSources, src)
					} else {
						normalizedTier := strings.TrimSpace(matchedTier)
						matchTierFound := false
						for _, rank := range req.SintaRank {
							normRank := strings.TrimSpace(strings.ReplaceAll(strings.ToLower(rank), "sinta", ""))
							if normRank == normalizedTier {
								matchTierFound = true
								break
							}
						}
						if matchTierFound {
							filteredSources = append(filteredSources, src)
						}
					}
				}
			}
			sources = filteredSources
		}
	}


	// Strict title check for book type searches: title must contain the query
	if req.Type == "book" {
		var filtered []models.AcademicSource
		for _, src := range sources {
			if strings.Contains(strings.ToLower(src.Title), strings.ToLower(req.Query)) {
				filtered = append(filtered, src)
			}
		}
		sources = filtered
	}

	// Strict title check for journal type searches: title must contain the query
	if req.Type == "journal" {
		var filtered []models.AcademicSource
		for _, src := range sources {
			if strings.Contains(strings.ToLower(src.Title), strings.ToLower(req.Query)) {
				filtered = append(filtered, src)
			}
		}
		sources = filtered
	}

	// Strict title check for article type searches: title must contain the query
	if req.Type == "article" {
		var filtered []models.AcademicSource
		for _, src := range sources {
			if strings.Contains(strings.ToLower(src.Title), strings.ToLower(req.Query)) {
				filtered = append(filtered, src)
			}
		}
		sources = filtered
	}

	// Short-circuit: empty results — do NOT call Gemini
	if len(sources) == 0 {
		return c.Status(fiber.StatusOK).JSON(models.ResearchResponse{
			Synthesis:  "Tidak ditemukan literatur yang relevan untuk topik ini.",
			References: []models.AcademicSource{},
			LatencyMs:  time.Since(start).Milliseconds(),
		})
	}

	// Step 4: AI Synthesis via Gemini
	synthesis, err := h.geminiClient.Synthesize(req.Query, sources)
	if err != nil {
		// Gemini failed — still return references without synthesis
		synthesis = "Sintesis AI sedang tidak tersedia. Silakan lihat referensi di bawah."
	}

	// Strip abstracts from response disabled so frontend can print abstracts to PDF
	// for i := range sources {
	// 	sources[i].Abstract = ""
	// }

	return c.Status(fiber.StatusOK).JSON(models.ResearchResponse{
		Synthesis:  synthesis,
		References: sources,
		LatencyMs:  time.Since(start).Milliseconds(),
	})
}

// containsAll checks if the rank selection contains "All" or "all" case insensitively.
func containsAll(slice []string) bool {
	for _, s := range slice {
		if strings.ToLower(strings.TrimSpace(s)) == "all" {
			return true
		}
	}
	return false
}

// isGibberish checks if a string is a keyboard smash, gibberish, or random repetition.
func isGibberish(s string) bool {
	s = strings.ToLower(strings.TrimSpace(s))
	if len(s) < 3 {
		return true
	}

	// 1. Check for lack of vowels in words of reasonable length
	isVowel := func(r rune) bool {
		return strings.ContainsRune("aeiouy", r)
	}

	words := strings.Fields(s)
	for _, word := range words {
		// Clean punctuation
		wordCleaned := strings.Map(func(r rune) rune {
			if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') {
				return r
			}
			return -1
		}, word)

		if len(wordCleaned) >= 5 {
			vowelCount := 0
			for _, r := range wordCleaned {
				if isVowel(r) {
					vowelCount++
				}
			}
			if vowelCount == 0 {
				return true
			}
		}
	}

	// 2. Keyboard sweeps and repetitions
	gibberishPatterns := []string{
		"asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl",
		"qwer", "wert", "erty", "rtyu", "tyui", "yuio", "uiop",
		"zxcv", "xcvb", "cvbn", "vbnm",
		"asasas", "aaaaaa", "bbbbbb", "cccccc", "dddddd",
	}
	for _, p := range gibberishPatterns {
		if strings.Contains(s, p) {
			return true
		}
	}

	return false
}

// HandleAsk handles asking a question about selected academic references.
func (h *ResearchHandler) HandleAsk(c *fiber.Ctx) error {
	start := time.Now()

	var req models.AskRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format request tidak valid",
		})
	}

	req.Question = strings.TrimSpace(req.Question)

	// User comments: Return static template for gibberish/short inputs without calling Gemini
	if isGibberish(req.Question) {
		return c.Status(fiber.StatusOK).JSON(models.AskResponse{
			Answer:    "Pertanyaan Anda tidak dikenali atau berupa teks acak. Silakan ajukan pertanyaan yang valid, spesifik, dan akademis mengenai referensi yang Anda pilih (misalnya: menanyakan kontribusi utama, metodologi, temuan hasil, atau perbandingan abstrak dari artikel yang terpilih).",
			LatencyMs: time.Since(start).Milliseconds(),
		})
	}

	if len(req.References) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Pilih setidaknya satu referensi sebelum mengajukan pertanyaan.",
		})
	}

	answer, err := h.geminiClient.Ask(req.Question, req.References)
	if err != nil {
		answer = "Sistem Tanya Jawab AI sedang tidak tersedia saat ini. Silakan coba beberapa saat lagi."
	}

	return c.Status(fiber.StatusOK).JSON(models.AskResponse{
		Answer:    answer,
		LatencyMs: time.Since(start).Milliseconds(),
	})
}
