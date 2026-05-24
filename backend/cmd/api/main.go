package main

import (
	"log"
	"os"
	"time"

	"fuenzer-research/backend/internal/config"
	"fuenzer-research/backend/internal/handlers"
	"fuenzer-research/backend/internal/services/gemini"
	"fuenzer-research/backend/internal/services/scholar"
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
	scholarClient := scholar.NewClient()
	geminiClient := gemini.NewClient(cfg.GeminiAPIKey)

	// Resolve sinta_data.json path — check multiple locations
	sintaDataPath := resolveSintaPath()
	sintaMapper, err := sinta.GetMapper(sintaDataPath)
	if err != nil {
		log.Fatalf("Failed to load SINTA data: %v", err)
	}

	// Initialize handler
	researchHandler := handlers.NewResearchHandler(scholarClient, geminiClient, sintaMapper)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Fuenzer Research API v1",
	})

	// Middleware: Logger
	app.Use(logger.New())

	// Middleware: CORS — strict per security-policy.md
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173, https://research.fuenzer.web.id",
		AllowHeaders: "Origin, Content-Type, Accept, X-Demo-Token",
	}))

	// Middleware: Rate Limiting — 50 req/min per IP (hackathon-safe)
	app.Use(limiter.New(limiter.Config{
		Max:        50,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			// Allow demo bypass for hackathon judges
			if cfg.DemoBypassToken != "" {
				token := c.Get("X-Demo-Token")
				if token == cfg.DemoBypassToken {
					return "demo-bypass"
				}
			}
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

// resolveSintaPath checks several locations for sinta_data.json.
func resolveSintaPath() string {
	paths := []string{
		"data/sinta_data.json",    // relative to working directory (production Docker)
		"../data/sinta_data.json", // relative to cmd/api/
		"backend/data/sinta_data.json", // from project root
	}
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	// Default fallback
	return "data/sinta_data.json"
}
