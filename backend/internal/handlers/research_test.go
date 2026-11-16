package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"fuenzer-research/backend/internal/services/openalex"

	"github.com/gofiber/fiber/v2"
)

type timeoutError struct{}

func (timeoutError) Error() string   { return "i/o timeout" }
func (timeoutError) Timeout() bool   { return true }
func (timeoutError) Temporary() bool { return true }

func TestIsGibberish(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"ab", true},
		{"asdfgh", true},
		{"qwertz", true},
		{"aaaaaa", true},
		{"bcdfg", true},
		{"machine learning", false},
		{"pertanian berkelanjutan", false},
	}
	for _, tc := range tests {
		if got := isGibberish(tc.input); got != tc.want {
			t.Errorf("isGibberish(%q) = %v, want %v", tc.input, got, tc.want)
		}
	}
}

func TestRespondOpenAlexError(t *testing.T) {
	app := fiber.New()
	app.Get("/rate-limit", func(c *fiber.Ctx) error {
		return respondOpenAlexError(c, "test", &openalex.APIError{StatusCode: http.StatusTooManyRequests, Body: "limit"})
	})
	app.Get("/timeout", func(c *fiber.Ctx) error {
		return respondOpenAlexError(c, "test", timeoutError{})
	})
	app.Get("/deadline", func(c *fiber.Ctx) error {
		return respondOpenAlexError(c, "test", context.DeadlineExceeded)
	})
	app.Get("/upstream", func(c *fiber.Ctx) error {
		return respondOpenAlexError(c, "test", errors.New("unexpected failure"))
	})

	cases := []struct {
		path string
		want int
	}{
		{"/rate-limit", http.StatusTooManyRequests},
		{"/timeout", http.StatusGatewayTimeout},
		{"/deadline", http.StatusGatewayTimeout},
		{"/upstream", http.StatusBadGateway},
	}

	for _, tc := range cases {
		req := httptest.NewRequest(http.MethodGet, tc.path, nil)
		resp, err := app.Test(req)
		if err != nil {
			t.Fatalf("app.Test(%s) error: %v", tc.path, err)
		}
		if resp.StatusCode != tc.want {
			t.Errorf("%s status = %d, want %d", tc.path, resp.StatusCode, tc.want)
		}
	}
}

func TestResearchHandlerValidation(t *testing.T) {
	h := NewResearchHandler(nil, nil, nil, nil, nil)
	app := fiber.New()
	app.Post("/research", h.Handle)
	app.Post("/ask", h.HandleAsk)

	t.Run("rejects short query", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"query": "ai", "scope": "global"})
		req := httptest.NewRequest(http.MethodPost, "/research", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("got status %d, want 400", resp.StatusCode)
		}
	})

	t.Run("rejects invalid scope", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"query": "climate change", "scope": "mars"})
		req := httptest.NewRequest(http.MethodPost, "/research", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("got status %d, want 400", resp.StatusCode)
		}
	})

	t.Run("ask short-circuits gibberish", func(t *testing.T) {
		body, _ := json.Marshal(map[string]any{"question": "asdfgh", "references": []any{}})
		req := httptest.NewRequest(http.MethodPost, "/ask", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("got status %d, want 200", resp.StatusCode)
		}
	})

	t.Run("ask requires at least one reference", func(t *testing.T) {
		body, _ := json.Marshal(map[string]any{"question": "What is the main finding?", "references": []any{}})
		req := httptest.NewRequest(http.MethodPost, "/ask", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("got status %d, want 400", resp.StatusCode)
		}
	})
}
