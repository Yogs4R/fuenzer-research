package handlers

import (
	"context"
	"fmt"
	"html"
	"log"
	"regexp"
	"strings"

	"fuenzer-research/backend/internal/services/email"
	firebaseService "fuenzer-research/backend/internal/services/firebase"

	"firebase.google.com/go/v4/auth"
	"github.com/gofiber/fiber/v2"
)

const defaultFrontendOrigin = "https://research.fuenzer.web.id"

// emailRegex validates email format per RFC 5322 (simplified) and blocks CRLF injection.
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// isValidEmail checks that the email address has a valid format and contains no
// header-injection characters (\r or \n). Returns false if either check fails.
func isValidEmail(addr string) bool {
	if strings.ContainsAny(addr, "\r\n") {
		return false
	}
	return emailRegex.MatchString(addr)
}

type firebaseAuthClient interface {
	GenerateEmailVerificationLink(ctx context.Context, email string) (string, error)
	GeneratePasswordResetLink(ctx context.Context, email string) (string, error)
	VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error)
}

type AuthHandler struct {
	firebaseClient firebaseAuthClient
	emailClient    *email.Client
	allowedOrigins []string
	allowLocalhost bool
}

func NewAuthHandler(fbClient *firebaseService.Client, emailClient *email.Client, allowedOriginsCSV string, allowLocalhost bool) *AuthHandler {
	var fb firebaseAuthClient
	if fbClient != nil {
		fb = fbClient
	}
	return newAuthHandlerWithClient(fb, emailClient, allowedOriginsCSV, allowLocalhost)
}

func newAuthHandlerWithClient(fb firebaseAuthClient, emailClient *email.Client, allowedOriginsCSV string, allowLocalhost bool) *AuthHandler {
	var allowed []string
	for _, raw := range strings.Split(allowedOriginsCSV, ",") {
		trimmed := strings.TrimSpace(raw)
		if trimmed == "" {
			continue
		}
		if !allowLocalhost && isLocalhostOrigin(trimmed) {
			continue
		}
		allowed = append(allowed, trimmed)
	}
	if len(allowed) == 0 {
		allowed = []string{
			defaultFrontendOrigin,
			"https://fuenzer-research-330213410510.us-central1.run.app",
		}
	}
	return &AuthHandler{
		firebaseClient: fb,
		emailClient:    emailClient,
		allowedOrigins: allowed,
		allowLocalhost: allowLocalhost,
	}
}

func isLocalhostOrigin(origin string) bool {
	return strings.HasPrefix(origin, "http://localhost:") ||
		strings.HasPrefix(origin, "http://127.0.0.1:") ||
		origin == "http://localhost" ||
		origin == "http://127.0.0.1"
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type authEmailKind struct {
	routePath      string
	subject        string
	logLabel       string
	enumeratedMsg  string
	genLinkFailMsg string
	sendFailMsg    string
	successMsg     string
	templateConfig authEmailTemplateConfig
	generateLink   func(ctx context.Context, addr string) (string, error)
}

type authEmailTemplateConfig struct {
	htmlTitle string
	enTitle   string
	enIntro   string
	enButton  string
	enNote    string
	idTitle   string
	idIntro   string
	idButton  string
	idNote    string
}

func resolveAllowedOrigin(origin string, allowedOrigins []string, allowLocalhost bool) string {
	origin = strings.TrimSpace(origin)
	if origin == "" {
		return defaultFrontendOrigin
	}
	if !allowLocalhost && isLocalhostOrigin(origin) {
		return defaultFrontendOrigin
	}
	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return origin
		}
	}
	if allowLocalhost && isLocalhostOrigin(origin) {
		return origin
	}
	return defaultFrontendOrigin
}

func formatCustomRedirectLink(origin, routePath, rawLink string) string {
	if idx := strings.Index(rawLink, "?"); idx != -1 {
		return fmt.Sprintf("%s%s%s", origin, routePath, rawLink[idx:])
	}
	return rawLink
}

func (h *AuthHandler) sendAuthEmail(c *fiber.Ctx, addr string, kind authEmailKind) error {
	origin := resolveAllowedOrigin(c.Get("Origin"), h.allowedOrigins, h.allowLocalhost)

	link, err := kind.generateLink(context.Background(), addr)
	if err != nil {
		// Log without PII — do not include the full email address in logs
		log.Printf("[Auth] Error generating %s link: %v", kind.logLabel, err)
		if strings.Contains(err.Error(), "EMAIL_NOT_FOUND") {
			return c.JSON(fiber.Map{"message": kind.enumeratedMsg})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": kind.genLinkFailMsg,
		})
	}

	customLink := formatCustomRedirectLink(origin, kind.routePath, link)
	emailBody := renderAuthEmailHTML(kind.templateConfig, customLink)

	if err := h.emailClient.SendEmail(addr, kind.subject, emailBody); err != nil {
		log.Printf("[Auth] Error sending %s email: %v", kind.logLabel, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": kind.sendFailMsg,
		})
	}

	return c.JSON(fiber.Map{"message": kind.successMsg})
}

func (h *AuthHandler) handleEmailAction(c *fiber.Ctx, kind authEmailKind) error {
	if h.firebaseClient == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Layanan autentikasi tidak tersedia saat ini. Silakan coba beberapa saat lagi.",
		})
	}

	var req ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil || req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format email tidak valid.",
		})
	}

	req.Email = strings.TrimSpace(req.Email)
	if !isValidEmail(req.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format email tidak valid.",
		})
	}

	return h.sendAuthEmail(c, req.Email, kind)
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	return h.handleEmailAction(c, authEmailKind{
		routePath:      "/reset-password",
		subject:        "Atur Ulang Kata Sandi Akun Fuenzer Research Anda",
		logLabel:       "password reset",
		enumeratedMsg:  "Tautan reset password telah dikirim ke email Anda jika terdaftar.",
		genLinkFailMsg: "Gagal menghasilkan tautan reset password. Silakan coba beberapa saat lagi.",
		sendFailMsg:    "Gagal mengirimkan email reset password. Silakan hubungi dukungan.",
		successMsg:     "Tautan reset password telah dikirim ke email Anda.",
		generateLink: func(ctx context.Context, addr string) (string, error) {
			return h.firebaseClient.GeneratePasswordResetLink(ctx, addr)
		},
		templateConfig: authEmailTemplateConfig{
			htmlTitle: "Reset Your Password",
			enTitle:   "Reset Your Password",
			enIntro:   "We received a request to reset the password for your Fuenzer Research account. Click the button below to set a new password:",
			enButton:  "Reset Password",
			enNote:    "This link is only valid for 1 hour. If you did not make this request, you can safely ignore this email.",
			idTitle:   "Atur Ulang Kata Sandi Anda",
			idIntro:   "Kami menerima permintaan untuk mereset kata sandi akun Fuenzer Research Anda. Klik tombol di bawah ini untuk mengatur kata sandi baru:",
			idButton:  "Atur Ulang Kata Sandi",
			idNote:    "Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda tidak akan berubah.",
		},
	})
}

func (h *AuthHandler) SendVerification(c *fiber.Ctx) error {
	if h.firebaseClient == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Layanan autentikasi tidak tersedia saat ini. Silakan coba beberapa saat lagi.",
		})
	}

	authHeader := strings.TrimSpace(c.Get("Authorization"))
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Autentikasi diperlukan untuk mengirim verifikasi email.",
		})
	}
	idToken := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	if idToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Autentikasi diperlukan untuk mengirim verifikasi email.",
		})
	}

	decoded, err := h.firebaseClient.VerifyIDToken(c.Context(), idToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Sesi tidak valid atau telah berakhir. Silakan login kembali.",
		})
	}

	emailAddr, _ := decoded.Claims["email"].(string)
	emailAddr = strings.TrimSpace(emailAddr)
	if !isValidEmail(emailAddr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email tidak ditemukan pada akun.",
		})
	}
	if verified, _ := decoded.Claims["email_verified"].(bool); verified {
		return c.JSON(fiber.Map{"message": "Email Anda sudah terverifikasi."})
	}

	return h.sendAuthEmail(c, emailAddr, authEmailKind{
		routePath:      "/verify-email",
		subject:        "Verifikasi Email Akun Fuenzer Research Anda",
		logLabel:       "email verification",
		enumeratedMsg:  "Tautan verifikasi telah dikirim ke email Anda jika terdaftar.",
		genLinkFailMsg: "Gagal menghasilkan tautan verifikasi. Silakan coba beberapa saat lagi.",
		sendFailMsg:    "Gagal mengirimkan email verifikasi. Silakan hubungi dukungan.",
		successMsg:     "Tautan verifikasi telah dikirim ke email Anda.",
		generateLink:   h.firebaseClient.GenerateEmailVerificationLink,
		templateConfig: authEmailTemplateConfig{
			htmlTitle: "Verify Your Email Address",
			enTitle:   "Verify Your Email Address",
			enIntro:   "Thank you for signing up with Fuenzer Research. Please click the button below to verify your email address and activate your account:",
			enButton:  "Verify Email",
			enNote:    "This link is only valid for 1 hour. If you did not sign up for an account, you can safely ignore this email.",
			idTitle:   "Verifikasi Alamat Email Anda",
			idIntro:   "Terima kasih telah mendaftar di Fuenzer Research. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun:",
			idButton:  "Verifikasi Email",
			idNote:    "Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.",
		},
	})
}

func renderAuthEmailHTML(cfg authEmailTemplateConfig, rawLink string) string {
	safeLink := html.EscapeString(rawLink)
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>%s</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { width: 100%%; background-color: #F8FAFC; padding: 40px 0; }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
    .header { background-color: #000000; padding: 24px 20px; text-align: center; border-bottom: 1px solid #000000; }
    .header img { height: 64px; width: auto; }
    .content { padding: 32px 30px; color: #334155; }
    .section-title { font-size: 18px; font-weight: 700; color: #0F172A; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 16px; }
    .btn-container { text-align: center; margin: 24px 0; }
    .btn {
      background-color: #0D9488;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 28px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.2);
    }
    .footer { background-color: #F8FAFC; padding: 24px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { font-size: 12px; color: #94A3B8; margin: 0; }
    .divider { height: 1px; background-color: #F1F5F9; margin: 24px 0; }
    .link-fallback { font-size: 11px; word-break: break-all; color: #64748B; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://research.fuenzer.web.id/assets/dark/fuenzer-research-logo-dark.png" alt="Fuenzer Research Logo" />
      </div>
      <div class="content">
        <div class="section-title">%s</div>
        <p>Hello,</p>
        <p>%s</p>
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">%s</a>
        </div>
        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Important:</strong> %s
        </p>

        <div class="divider"></div>

        <div class="section-title">%s</div>
        <p>Halo,</p>
        <p>%s</p>
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">%s</a>
        </div>
        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Penting:</strong> %s
        </p>

        <div class="divider"></div>

        <p style="font-size: 11px; color: #94A3B8; margin-bottom: 4px;">
          If the buttons do not work, copy and paste this link into your browser:<br/>
          (Jika tombol tidak berfungsi, salin dan tempel link ini ke browser Anda):
        </p>
        <div class="link-fallback">
          <a href="%s" style="color: #0D9488; text-decoration: underline;">%s</a>
        </div>
      </div>
      <div class="footer">
        <p>&copy; 2026 Fuenzer Research. All Rights Reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
		html.EscapeString(cfg.htmlTitle),
		html.EscapeString(cfg.enTitle),
		html.EscapeString(cfg.enIntro),
		safeLink,
		html.EscapeString(cfg.enButton),
		html.EscapeString(cfg.enNote),
		html.EscapeString(cfg.idTitle),
		html.EscapeString(cfg.idIntro),
		safeLink,
		html.EscapeString(cfg.idButton),
		html.EscapeString(cfg.idNote),
		safeLink,
		safeLink,
	)
}
