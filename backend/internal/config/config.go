package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment variables.
type Config struct {
	GeminiAPIKey    string
	Port            string
	Env             string
	DemoBypassToken string
}

// Load reads environment variables from .env and returns a Config.
func Load() *Config {
	// Load .env file (silently ignore if not found — for production)
	_ = godotenv.Load()

	cfg := &Config{
		GeminiAPIKey:    getEnv("GEMINI_API_KEY", ""),
		Port:            getEnv("PORT", "8080"),
		Env:             getEnv("ENV", "development"),
		DemoBypassToken: getEnv("DEMO_BYPASS_TOKEN", ""),
	}

	if cfg.GeminiAPIKey == "" {
		log.Println("WARNING: GEMINI_API_KEY is not set. AI synthesis will fail.")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
