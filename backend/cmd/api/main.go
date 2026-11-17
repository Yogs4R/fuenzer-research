package main

import (
	"log"
	"net"
	"os"
	"strings"
	"time"

	"fuenzer-research/backend/internal/config"
	"fuenzer-research/backend/internal/handlers"
	"fuenzer-research/backend/internal/services/email"
	firebaseService "fuenzer-research/backend/internal/services/firebase"
	"fuenzer-research/backend/internal/services/garuda"
	"fuenzer-research/backend/internal/services/gemini"
	"fuenzer-research/backend/internal/services/googlebooks"
	"fuenzer-research/backend/internal/services/openalex"
	"fuenzer-research/backend/internal/services/sinta"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize services
	openalexClient := openalex.NewClient()
	geminiClient := gemini.NewClient(cfg.GeminiAPIKey)
	googleBooksClient := googlebooks.NewClient(cfg.GoogleBooksAPIKey)

	// Initialize Firebase Admin client
	firebaseClient, err := firebaseService.NewClient(cfg)
	if err != nil {
		log.Printf("WARNING: Firebase Admin client could not be initialized: %v. Password reset email service will not work.", err)
	}

	// Initialize Email SMTP client
	emailClient := email.NewClient(cfg)

	// Initialize local Garuda SQLite database client
	garudaClient, err := garuda.NewClient()
	if err != nil {
		log.Fatalf("Failed to load GARUDA SQLite client: %v", err)
	}

	// Resolve sinta_journals_data.json path — check multiple locations
	sintaDataPath := config.ResolveDataFile("sinta_journals_data.json")
	sintaMapper, err := sinta.GetMapper(sintaDataPath)
	if err != nil {
		log.Fatalf("Failed to load SINTA data: %v", err)
	}

	// Initialize handler
	researchHandler := handlers.NewResearchHandler(openalexClient, geminiClient, sintaMapper, garudaClient, googleBooksClient)
	autocompleteHandler := handlers.NewAutocompleteHandler(openalexClient)
	authHandler := handlers.NewAuthHandler(firebaseClient, emailClient, cfg.AllowedOrigins, strings.ToLower(strings.TrimSpace(cfg.Env)) != "production")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Fuenzer Research API v1",
		ServerHeader: "Fuenzer",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
		BodyLimit:    256 * 1024, // 256 KB max request body
	})

	// Middleware: Logger
	app.Use(logger.New())

	// Middleware: Security Headers (A+ rating on securityheaders.com)
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		c.Set("X-Frame-Options", "SAMEORIGIN")
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), interest-cohort=()")
		c.Set("Content-Security-Policy", "default-src 'self'; script-src 'self' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://images.unsplash.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://*.analytics.google.com https://cloudflareinsights.com; frame-src 'self' https://fuenzer-research.firebaseapp.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content; require-trusted-types-for 'script'; trusted-types default appPolicy;")
		return c.Next()
	})

	// Middleware: CORS — strict per security-policy.md
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Middleware: Rate Limiting — 15 req/min per IP (excludes static assets & SEO files)
	app.Use(limiter.New(limiter.Config{
		Next: func(c *fiber.Ctx) bool {
			path := c.Path()
			// Exempt health check, SEO/GEO files, and static assets from rate limiting
			if path == "/api/v1/health" ||
				path == "/robots.txt" ||
				path == "/sitemap.xml" ||
				path == "/llms.txt" ||
				path == "/llms-full.txt" ||
				path == "/site.webmanifest" ||
				strings.HasPrefix(path, "/assets/") ||
				strings.HasSuffix(path, ".ico") ||
				strings.HasSuffix(path, ".png") ||
				strings.HasSuffix(path, ".webp") ||
				strings.HasSuffix(path, ".js") ||
				strings.HasSuffix(path, ".css") {
				return true
			}
			return false
		},
		Max:          15,
		Expiration:   1 * time.Minute,
		KeyGenerator: clientIP,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Terlalu banyak permintaan. Silakan coba lagi dalam 1 menit.",
			})
		},
	}))

	// Health check
	app.Get("/api/v1/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "fuenzer-research"})
	})

	// API Routes
	api := app.Group("/api/v1")
	api.Post("/research", researchHandler.Handle)
	api.Post("/ask", researchHandler.HandleAsk)
	api.Get("/autocomplete", autocompleteHandler.Handle)

	// Auth Routes — stricter rate limit: 3 req / 5 min per IP to prevent email bombing
	authLimiter := limiter.New(limiter.Config{
		Max:          3,
		Expiration:   5 * time.Minute,
		KeyGenerator: clientIP,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Terlalu banyak permintaan. Silakan coba lagi dalam 5 menit.",
			})
		},
	})
	api.Post("/auth/forgot-password", authLimiter, authHandler.ForgotPassword)
	api.Post("/auth/send-verification", authLimiter, authHandler.SendVerification)

	// Serve static frontend files (production mode)
	if cfg.Env == "production" {
		app.Static("/", "./public")

		// Read index.html once into memory
		indexHTML, err := os.ReadFile("./public/index.html")
		if err != nil {
			log.Printf("WARNING: Could not read ./public/index.html: %v", err)
		}

		// SPA fallback: serve index.html for all non-API routes
		app.Get("/*", func(c *fiber.Ctx) error {
			c.Type("html")
			return c.Send(indexHTML)
		})
	}


	// Start server
	port := cfg.Port
	log.Printf("🚀 Fuenzer Research API starting on port %s (env: %s)", port, cfg.Env)
	log.Fatal(app.Listen(":" + port))
}

// Official Cloudflare edge CIDR ranges (https://www.cloudflare.com/ips/).
var cloudflareNets = func() []*net.IPNet {
	cidrs := []string{
		"173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
		"141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
		"197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
		"104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
		"2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32",
		"2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32",
	}
	nets := make([]*net.IPNet, 0, len(cidrs))
	for _, cidr := range cidrs {
		if _, ipNet, err := net.ParseCIDR(cidr); err == nil {
			nets = append(nets, ipNet)
		}
	}
	return nets
}()

func isCloudflareIP(ip net.IP) bool {
	if ip == nil {
		return false
	}
	for _, n := range cloudflareNets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

// lastForwardedIP returns the rightmost IP in X-Forwarded-For, which Cloud Run's
// Google Front End appends from the actual immediate TCP peer.
func lastForwardedIP(xff string) net.IP {
	parts := strings.Split(xff, ",")
	for i := len(parts) - 1; i >= 0; i-- {
		if parsed := net.ParseIP(strings.TrimSpace(parts[i])); parsed != nil {
			return parsed
		}
	}
	return nil
}

// clientIP extracts the client IP safely: CF-Connecting-IP is trusted only when
// the immediate peer IP recorded by Cloud Run's proxy belongs to Cloudflare.
func clientIP(c *fiber.Ctx) string {
	peerIP := lastForwardedIP(c.Get("X-Forwarded-For"))
	if isCloudflareIP(peerIP) {
		if cfIP := net.ParseIP(strings.TrimSpace(c.Get("CF-Connecting-IP"))); cfIP != nil {
			return cfIP.String()
		}
	}
	if peerIP != nil {
		return peerIP.String()
	}
	return c.IP()
}
