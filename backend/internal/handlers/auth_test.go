package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestIsValidEmail(t *testing.T) {
	tests := []struct {
		addr string
		want bool
	}{
		{"user@example.com", true},
		{"first.last+tag@sub.domain.co.id", true},
		{"bad\r\n@example.com", false},
		{"user@example.com\nBcc: evil@attacker.com", false},
		{"not-an-email", false},
		{"", false},
	}
	for _, tc := range tests {
		if got := isValidEmail(tc.addr); got != tc.want {
			t.Errorf("isValidEmail(%q) = %v, want %v", tc.addr, got, tc.want)
		}
	}
}

func TestResolveAllowedOrigin(t *testing.T) {
	allowed := []string{"https://research.fuenzer.web.id"}

	if got := resolveAllowedOrigin("", allowed); got != defaultFrontendOrigin {
		t.Errorf("empty origin = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("https://evil.example.com", allowed); got != defaultFrontendOrigin {
		t.Errorf("untrusted origin = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("http://localhost:5173", allowed); got != "http://localhost:5173" {
		t.Errorf("localhost origin = %q, want http://localhost:5173", got)
	}
	if got := resolveAllowedOrigin("https://research.fuenzer.web.id", allowed); got != "https://research.fuenzer.web.id" {
		t.Errorf("allowed origin = %q, want https://research.fuenzer.web.id", got)
	}
}

func TestAuthHandlerGuards(t *testing.T) {
	h := NewAuthHandler(nil, nil, "https://research.fuenzer.web.id")
	app := fiber.New()
	app.Post("/forgot", h.ForgotPassword)
	app.Post("/verify", h.SendVerification)

	for _, path := range []string{"/forgot", "/verify"} {
		req := httptest.NewRequest(http.MethodPost, path, bytes.NewBufferString(`{"email":"user@example.com"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusInternalServerError {
			t.Errorf("%s without firebase client = %d, want 500", path, resp.StatusCode)
		}
	}
}

func TestRenderAuthEmailHTMLEscapesInput(t *testing.T) {
	out := renderAuthEmailHTML(authEmailTemplateConfig{
		htmlTitle: "Verify",
		enTitle:   "Verify",
		enIntro:   "Intro",
		enButton:  "Click",
		enNote:    "Note",
		idTitle:   "Verifikasi",
		idIntro:   "Pembuka",
		idButton:  "Klik",
		idNote:    "Catatan",
	}, `https://research.fuenzer.web.id/verify-email?code=123&x="><script>`)

	if strings.Contains(out, `<script>`) {
		t.Fatalf("expected HTML escaping of raw link, got unescaped script tag")
	}
}
