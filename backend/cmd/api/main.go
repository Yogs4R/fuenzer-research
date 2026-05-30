package main

import (
	"log"
	"os"
	"time"

	"fuenzer-research/backend/internal/config"
	"fuenzer-research/backend/internal/handlers"
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

	// Initialize local Garuda SQLite database client
	garudaClient, err := garuda.NewClient()
	if err != nil {
		log.Fatalf("Failed to load GARUDA SQLite client: %v", err)
	}

	// Resolve sinta_data.json path — check multiple locations
	sintaDataPath := resolveSintaPath()
	sintaMapper, err := sinta.GetMapper(sintaDataPath)
	if err != nil {
		log.Fatalf("Failed to load SINTA data: %v", err)
	}

	// Initialize handler
	researchHandler := handlers.NewResearchHandler(openalexClient, geminiClient, sintaMapper, garudaClient, googleBooksClient)
	autocompleteHandler := handlers.NewAutocompleteHandler(openalexClient)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Fuenzer Research API v1",
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
		c.Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://lh3.googleusercontent.com https://images.unsplash.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com; frame-src 'self' https://fuenzer-research.firebaseapp.com; object-src 'none'; base-uri 'self'; form-action 'self';")
		return c.Next()
	})

	// Middleware: CORS — strict per security-policy.md
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.AllowedOrigins,
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Middleware: Rate Limiting — 50 req/min per IP (hackathon-safe)
	app.Use(limiter.New(limiter.Config{
		Max:        50,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
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

	// Serve static frontend files (production mode)
	if cfg.Env == "production" {
		app.Static("/", "./public")

		// SPA fallback: serve index.html for all non-API routes
		app.Get("/*", func(c *fiber.Ctx) error {
			return c.SendFile("./public/index.html")
		})
	}

	// Start server
	port := cfg.Port
	log.Printf("🚀 Fuenzer Research API starting on port %s (env: %s)", port, cfg.Env)
	log.Fatal(app.Listen(":" + port))
}

// resolveSintaPath checks several locations for sinta_journals_data.json.
func resolveSintaPath() string {
	paths := []string{
		"data/sinta_journals_data.json",    // relative to working directory (production Docker)
		"../data/sinta_journals_data.json", // relative to cmd/api/
		"backend/data/sinta_journals_data.json", // from project root
	}
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	// Default fallback
	return "data/sinta_journals_data.json"
}
