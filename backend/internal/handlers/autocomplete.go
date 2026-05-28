package handlers

import (
	"fuenzer-research/backend/internal/services/openalex"

	"github.com/gofiber/fiber/v2"
)

// AutocompleteHandler handles autocomplete/suggestion requests.
type AutocompleteHandler struct {
	openalexClient *openalex.Client
}

// NewAutocompleteHandler creates a new autocomplete handler.
func NewAutocompleteHandler(oc *openalex.Client) *AutocompleteHandler {
	return &AutocompleteHandler{
		openalexClient: oc,
	}
}

// Handle processes GET /api/v1/autocomplete?q=... requests.
// Returns spelling suggestions from OpenAlex autocomplete API.
func (h *AutocompleteHandler) Handle(c *fiber.Ctx) error {
	query := c.Query("q")
	if len(query) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query must be at least 2 characters.",
		})
	}

	if len(query) > 200 {
		query = query[:200]
	}

	suggestions, err := h.openalexClient.Autocomplete(query)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"suggestions": []string{},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"suggestions": suggestions,
	})
}
