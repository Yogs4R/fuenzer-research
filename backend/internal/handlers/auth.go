package handlers

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"

	"fuenzer-research/backend/internal/services/email"
	firebaseService "fuenzer-research/backend/internal/services/firebase"

	"github.com/gofiber/fiber/v2"
)

// emailRegex validates email format per RFC 5322 (simplified) and blocks CRLF injection.
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// isValidEmail checks that the email address has a valid format and contains no
// header-injection characters (\r or \n). Returns false if either check fails.
func isValidEmail(email string) bool {
	if strings.ContainsAny(email, "\r\n") {
		return false
	}
	return emailRegex.MatchString(email)
}

type AuthHandler struct {
	firebaseClient *firebaseService.Client
	emailClient    *email.Client
}

func NewAuthHandler(fbClient *firebaseService.Client, emailClient *email.Client) *AuthHandler {
	return &AuthHandler{
		firebaseClient: fbClient,
		emailClient:    emailClient,
	}
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
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

	// Validate email format and block header injection characters
	if !isValidEmail(req.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format email tidak valid.",
		})
	}

	// Determine origin dynamically based on Request Headers
	origin := c.Get("Origin")
	if origin == "" {
		origin = "https://research.fuenzer.web.id"
	} else {
		// Verify allowed origins for security
		isAllowed := false
		allowedOrigins := []string{
			"https://research.fuenzer.web.id",
			"https://fuenzer-research-330213410510.us-central1.run.app",
		}
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				isAllowed = true
				break
			}
		}
		
		// Always allow local hostnames during development
		if !isAllowed && (strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:")) {
			isAllowed = true
		}

		if !isAllowed {
			origin = "https://research.fuenzer.web.id"
		}
	}

	ctx := context.Background()
	link, err := h.firebaseClient.GeneratePasswordResetLink(ctx, req.Email)
	if err != nil {
		// Log without PII — do not include the full email address in logs
		log.Printf("[Auth] Error generating password reset link: %v", err)

		// If user not found, we still return success (200 OK) to prevent user enumeration
		if strings.Contains(err.Error(), "EMAIL_NOT_FOUND") {
			return c.JSON(fiber.Map{
				"message": "Tautan reset password telah dikirim ke email Anda jika terdaftar.",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghasilkan tautan reset password. Silakan coba beberapa saat lagi.",
		})
	}

	// Format custom redirect link by extracting query params and directing to React routing path
	var customLink string
	if idx := strings.Index(link, "?"); idx != -1 {
		customLink = fmt.Sprintf("%s/reset-password%s", origin, link[idx:])
	} else {
		customLink = link
	}

	// Prepare HTML Email Template
	emailBody := getResetPasswordEmailTemplate(customLink)

	// Send Email using SMTP
	err = h.emailClient.SendEmail(req.Email, "Atur Ulang Kata Sandi Akun Fuenzer Research Anda", emailBody)
	if err != nil {
		// Log without PII
		log.Printf("[Auth] Error sending reset password email: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal mengirimkan email reset password. Silakan hubungi dukungan.",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tautan reset password telah dikirim ke email Anda.",
	})
}

func (h *AuthHandler) SendVerification(c *fiber.Ctx) error {
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

	// Validate email format and block header injection characters
	if !isValidEmail(req.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format email tidak valid.",
		})
	}

	// Determine origin dynamically based on Request Headers
	origin := c.Get("Origin")
	if origin == "" {
		origin = "https://research.fuenzer.web.id"
	} else {
		isAllowed := false
		allowedOrigins := []string{
			"https://research.fuenzer.web.id",
			"https://fuenzer-research-330213410510.us-central1.run.app",
		}
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				isAllowed = true
				break
			}
		}
		if !isAllowed && (strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:")) {
			isAllowed = true
		}
		if !isAllowed {
			origin = "https://research.fuenzer.web.id"
		}
	}

	ctx := context.Background()
	link, err := h.firebaseClient.GenerateEmailVerificationLink(ctx, req.Email)
	if err != nil {
		// Log without PII
		log.Printf("[Auth] Error generating email verification link: %v", err)
		if strings.Contains(err.Error(), "EMAIL_NOT_FOUND") {
			return c.JSON(fiber.Map{
				"message": "Tautan verifikasi telah dikirim ke email Anda jika terdaftar.",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghasilkan tautan verifikasi. Silakan coba beberapa saat lagi.",
		})
	}

	// Format custom redirect link by directing to React routing path `/verify-email`
	var customLink string
	if idx := strings.Index(link, "?"); idx != -1 {
		customLink = fmt.Sprintf("%s/verify-email%s", origin, link[idx:])
	} else {
		customLink = link
	}

	// Prepare HTML Email Template
	emailBody := getEmailVerificationTemplate(customLink)

	// Send Email using SMTP
	err = h.emailClient.SendEmail(req.Email, "Verifikasi Email Akun Fuenzer Research Anda", emailBody)
	if err != nil {
		// Log without PII
		log.Printf("[Auth] Error sending verification email: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal mengirimkan email verifikasi. Silakan hubungi dukungan.",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tautan verifikasi telah dikirim ke email Anda.",
	})
}

func getEmailVerificationTemplate(link string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email Address</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%%;
      background-color: #F8FAFC;
      padding: 40px 0;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
    .header {
      background-color: #121212;
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid #1E293B;
    }
    .header img {
      height: 48px;
      width: auto;
    }
    .content {
      padding: 32px 30px;
      color: #334155;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 24px 0;
    }
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
    .footer {
      background-color: #F8FAFC;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
    }
    .footer p {
      font-size: 12px;
      color: #94A3B8;
      margin: 0;
    }
    .divider {
      height: 1px;
      background-color: #F1F5F9;
      margin: 24px 0;
    }
    .link-fallback {
      font-size: 11px;
      word-break: break-all;
      color: #64748B;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://research.fuenzer.web.id/assets/dark/fuenzer-research-logo-dark.png" alt="Fuenzer Research Logo" />
      </div>
      <div class="content">
        <!-- English Section -->
        <div class="section-title">Verify Your Email Address</div>
        <p>Hello,</p>
        <p>Thank you for signing up with Fuenzer Research. Please click the button below to verify your email address and activate your account:</p>
        
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">Verify Email</a>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Important:</strong> This link is only valid for 1 hour. If you did not sign up for an account, you can safely ignore this email.
        </p>

        <div class="divider"></div>

        <!-- Indonesian Section -->
        <div class="section-title">Verifikasi Alamat Email Anda</div>
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di Fuenzer Research. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun:</p>
        
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">Verifikasi Email</a>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Penting:</strong> Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.
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
</html>`, link, link, link, link)
}

func getResetPasswordEmailTemplate(link string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%%;
      background-color: #F8FAFC;
      padding: 40px 0;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
    .header {
      background-color: #121212;
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid #1E293B;
    }
    .header img {
      height: 48px;
      width: auto;
    }
    .content {
      padding: 32px 30px;
      color: #334155;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
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
    .footer {
      background-color: #F8FAFC;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
    }
    .footer p {
      font-size: 12px;
      color: #94A3B8;
      margin: 0;
    }
    .divider {
      height: 1px;
      background-color: #F1F5F9;
      margin: 24px 0;
    }
    .link-fallback {
      font-size: 11px;
      word-break: break-all;
      color: #64748B;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://research.fuenzer.web.id/assets/dark/fuenzer-research-logo-dark.png" alt="Fuenzer Research Logo" />
      </div>
      <div class="content">
        <!-- English Section -->
        <div class="section-title">Reset Your Password</div>
        <p>Hello,</p>
        <p>We received a request to reset the password for your Fuenzer Research account. Click the button below to set a new password:</p>
        
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">Reset Password</a>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Important:</strong> This link is only valid for 1 hour. If you did not make this request, you can safely ignore this email.
        </p>

        <div class="divider"></div>

        <!-- Indonesian Section -->
        <div class="section-title">Atur Ulang Kata Sandi Anda</div>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mereset kata sandi akun Fuenzer Research Anda. Klik tombol di bawah ini untuk mengatur kata sandi baru:</p>
        
        <div class="btn-container">
          <a href="%s" class="btn" target="_blank">Atur Ulang Kata Sandi</a>
        </div>

        <p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
          <strong>Penting:</strong> Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda tidak akan berubah.
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
</html>`, link, link, link, link)
}
