package handlers

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"firebase.google.com/go/v4/auth"
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

	if got := resolveAllowedOrigin("", allowed, true); got != defaultFrontendOrigin {
		t.Errorf("empty origin = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("https://evil.example.com", allowed, true); got != defaultFrontendOrigin {
		t.Errorf("untrusted origin = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("http://localhost:5173", allowed, true); got != "http://localhost:5173" {
		t.Errorf("localhost origin (dev) = %q, want http://localhost:5173", got)
	}
	if got := resolveAllowedOrigin("http://localhost:5173", []string{"http://localhost:5173", "https://research.fuenzer.web.id"}, false); got != defaultFrontendOrigin {
		t.Errorf("localhost origin (prod) = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("http://127.0.0.1:3000", allowed, false); got != defaultFrontendOrigin {
		t.Errorf("127.0.0.1 origin (prod) = %q, want %q", got, defaultFrontendOrigin)
	}
	if got := resolveAllowedOrigin("https://research.fuenzer.web.id", allowed, false); got != "https://research.fuenzer.web.id" {
		t.Errorf("allowed origin = %q, want https://research.fuenzer.web.id", got)
	}
}

type mockFirebaseAuth struct {
	verifyFn func(ctx context.Context, idToken string) (*auth.Token, error)
}

func (m *mockFirebaseAuth) GenerateEmailVerificationLink(ctx context.Context, email string) (string, error) {
	return "https://example.com/action?oobCode=123", nil
}

func (m *mockFirebaseAuth) GeneratePasswordResetLink(ctx context.Context, email string) (string, error) {
	return "https://example.com/action?oobCode=456", nil
}

func (m *mockFirebaseAuth) VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	return m.verifyFn(ctx, idToken)
}

func TestAuthHandlerGuards(t *testing.T) {
	h := NewAuthHandler(nil, nil, "https://research.fuenzer.web.id", false)
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

func TestSendVerificationRequiresAuth(t *testing.T) {
	mockFB := &mockFirebaseAuth{
		verifyFn: func(_ context.Context, idToken string) (*auth.Token, error) {
			switch idToken {
			case "verified-token":
				return &auth.Token{Claims: map[string]interface{}{
					"email":          "verified@example.com",
					"email_verified": true,
				}}, nil
			default:
				return nil, errors.New("invalid token")
			}
		},
	}
	h := newAuthHandlerWithClient(mockFB, nil, "https://research.fuenzer.web.id", false)
	app := fiber.New()
	app.Post("/verify", h.SendVerification)

	t.Run("missing bearer token returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/verify", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", resp.StatusCode)
		}
	})

	t.Run("invalid bearer token returns 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/verify", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer bad-token")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("status = %d, want 401", resp.StatusCode)
		}
	})

	t.Run("already verified user returns 200 without resending", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/verify", bytes.NewBufferString(`{}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer verified-token")
		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("status = %d, want 200", resp.StatusCode)
		}
	})
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
