package email

import (
	"fmt"
	"net/smtp"
	"strings"
	"fuenzer-research/backend/internal/config"
)

type Client struct {
	cfg *config.Config
}

func NewClient(cfg *config.Config) *Client {
	return &Client{cfg: cfg}
}

// sanitizeHeader strips CR and LF characters from header values to prevent
// Email Header Injection attacks (CWE-93).
func sanitizeHeader(s string) string {
	return strings.NewReplacer("\r", "", "\n", "").Replace(s)
}

func (c *Client) SendEmail(to, subject, htmlBody string) error {
	if c.cfg.SMTPHost == "" {
		return fmt.Errorf("SMTP host is not configured")
	}

	// Build headers — sanitize all user-supplied values to prevent header injection
	headers := make(map[string]string)
	headers["From"] = sanitizeHeader(c.cfg.SMTPFrom)
	headers["To"] = sanitizeHeader(to)
	headers["Subject"] = sanitizeHeader(subject)
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	// Compose message
	var msg strings.Builder
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	// Authentication
	auth := smtp.PlainAuth("", c.cfg.SMTPUser, c.cfg.SMTPPass, c.cfg.SMTPHost)

	addr := fmt.Sprintf("%s:%s", c.cfg.SMTPHost, c.cfg.SMTPPort)

	// Send email
	err := smtp.SendMail(addr, auth, c.cfg.SMTPFrom, []string{to}, []byte(msg.String()))
	if err != nil {
		return fmt.Errorf("failed to send email via SMTP: %w", err)
	}

	return nil
}
