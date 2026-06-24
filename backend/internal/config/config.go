package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment variables.
type Config struct {
	GeminiAPIKey      string
	GoogleBooksAPIKey string
	Port              string
	Env               string
	AllowedOrigins    string
	SMTPHost          string
	SMTPPort          string
	SMTPUser          string
	SMTPPass          string
	SMTPFrom          string
	FirebaseProjectID string
}

// Load reads environment variables from .env and returns a Config.
func Load() *Config {
	// Load .env file (silently ignore if not found — for production)
	_ = godotenv.Load()

	cfg := &Config{
		GeminiAPIKey:      getEnv("GEMINI_API_KEY", ""),
		GoogleBooksAPIKey: getEnv("GOOGLE_BOOKS_API_KEY", ""),
		Port:              getEnv("PORT", "8080"),
		Env:               getEnv("ENV", "development"),
		AllowedOrigins:    getEnv("ALLOWED_ORIGINS", "http://localhost:5173, https://research.fuenzer.web.id"),
		SMTPHost:          getEnv("SMTP_HOST", ""),
		SMTPPort:          getEnv("SMTP_PORT", "587"),
		SMTPUser:          getEnv("SMTP_USER", ""),
		SMTPPass:          getEnv("SMTP_PASS", ""),
		SMTPFrom:          getEnv("SMTP_FROM", ""),
		FirebaseProjectID: getEnv("FIREBASE_PROJECT_ID", ""),
	}

	if cfg.GeminiAPIKey == "" {
		log.Println("WARNING: GEMINI_API_KEY is not set. AI synthesis will fail.")
	}
	if cfg.GoogleBooksAPIKey == "" {
		log.Println("WARNING: GOOGLE_BOOKS_API_KEY is not set. Google Books search will fail.")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
