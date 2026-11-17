package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestClientIPAntiSpoofing(t *testing.T) {
	app := fiber.New()
	app.Get("/ip", func(c *fiber.Ctx) error {
		return c.SendString(clientIP(c))
	})

	tests := []struct {
		name string
		cfIP string
		xff  string
		want string
	}{
		{
			name: "rejects spoofed CF-Connecting-IP and spoofed leftmost XFF on direct run.app hit",
			cfIP: "1.2.3.4",
			xff:  "5.6.7.8, 203.0.113.99",
			want: "203.0.113.99",
		},
		{
			name: "trusts CF-Connecting-IP when immediate peer is Cloudflare edge",
			cfIP: "198.51.100.42",
			xff:  "198.51.100.42, 172.70.142.10",
			want: "198.51.100.42",
		},
		{
			name: "falls back to peer IP when CF-Connecting-IP is malformed",
			cfIP: "not-an-ip",
			xff:  "172.70.142.10",
			want: "172.70.142.10",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/ip", nil)
			if tc.cfIP != "" {
				req.Header.Set("CF-Connecting-IP", tc.cfIP)
			}
			if tc.xff != "" {
				req.Header.Set("X-Forwarded-For", tc.xff)
			}
			resp, err := app.Test(req)
			if err != nil {
				t.Fatal(err)
			}
			body, _ := io.ReadAll(resp.Body)
			if string(body) != tc.want {
				t.Errorf("clientIP = %q, want %q", string(body), tc.want)
			}
		})
	}
}
