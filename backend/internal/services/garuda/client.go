package garuda

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	"fuenzer-research/backend/internal/models"

	_ "modernc.org/sqlite"
)

// Client handles local SQLite queries against the garuda_articles_data.db.
type Client struct {
	dbPath string
}

// NewClient initializes a new Garuda SQLite database client.
func NewClient() (*Client, error) {
	dbPath := resolveGarudaPath()
	if _, err := os.Stat(dbPath); err != nil {
		return nil, fmt.Errorf("garuda database not found at %s: %w", dbPath, err)
	}
	log.Printf("📂 Garuda local database client loaded from %s", dbPath)
	return &Client{dbPath: dbPath}, nil
}

// resolveGarudaPath searches in several locations to find garuda_articles_data.db.
func resolveGarudaPath() string {
	paths := []string{
		"data/garuda_articles_data.db",          // production / Docker
		"../data/garuda_articles_data.db",       // relative to cmd/api
		"backend/data/garuda_articles_data.db",  // root execution
	}
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return "data/garuda_articles_data.db" // default fallback
}

// Search queries the SQLite table `artikel` for matching keyword search.
// It maps the results to modern models.AcademicSource structure.
func (c *Client) Search(query string, workType string) ([]models.AcademicSource, error) {
	db, err := sql.Open("sqlite", c.dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open garuda SQLite db: %w", err)
	}
	defer db.Close()

	// Adjust search limit based on type
	limit := 5
	if workType == "" {
		limit = 15
	}

	// Format keywords for case-insensitive LIKE search
	searchTerm := "%" + strings.ToLower(query) + "%"

	var rows *sql.Rows
	if workType == "journal" {
		rows, err = db.Query(
			`SELECT article_title, title, article_abstract, article_year, doi, url, source
			 FROM artikel
			 WHERE lower(title) LIKE ?
			 LIMIT ?`,
			searchTerm, limit,
		)
	} else {
		rows, err = db.Query(
			`SELECT article_title, title, article_abstract, article_year, doi, url, source
			 FROM artikel
			 WHERE lower(article_title) LIKE ? OR lower(article_abstract) LIKE ?
			 LIMIT ?`,
			searchTerm, searchTerm, limit,
		)
	}
	if err != nil {
		return nil, fmt.Errorf("garuda SQLite query execution failed: %w", err)
	}
	defer rows.Close()

	var sources []models.AcademicSource
	for rows.Next() {
		var articleTitle, journalTitle, abstract, doi, urlStr, sourceStr sql.NullString
		var year sql.NullInt64

		if err := rows.Scan(&articleTitle, &journalTitle, &abstract, &year, &doi, &urlStr, &sourceStr); err != nil {
			return nil, fmt.Errorf("failed to scan SQLite row: %w", err)
		}

		title := articleTitle.String
		publisher := journalTitle.String
		if publisher == "" {
			publisher = sourceStr.String
		}
		if publisher == "" {
			publisher = "Garuda Journal"
		}

		urlVal := urlStr.String
		if urlVal == "" {
			urlVal = doi.String
		}
		// Fallback URL if totally empty
		if urlVal == "" {
			urlVal = "https://garuda.kemdikbud.go.id"
		}

		// Garuda SQLite data represents Indonesian domestic publications.
		// Set ContentType appropriately based on the workType filter or default
		contentType := "journal-article"
		switch workType {
		case "article":
			contentType = "article"
		case "book":
			contentType = "book"
		case "journal":
			contentType = "journal"
			title = publisher
			publisher = articleTitle.String
		}

		// Sanitize title for ID generation
		sanitizedTitle := strings.Map(func(r rune) rune {
			if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
				return r
			}
			return '-'
		}, title)
		if len(sanitizedTitle) > 30 {
			sanitizedTitle = sanitizedTitle[:30]
		}
		idVal := fmt.Sprintf("garuda-%d-%s", year.Int64, strings.Trim(strings.ToLower(sanitizedTitle), "-"))

		source := models.AcademicSource{
			ID:          idVal,
			Title:       title,
			Authors:     []string{}, // SQLite schema has no author list
			Year:        int(year.Int64),
			Publisher:   publisher,
			Abstract:    abstract.String,
			URL:         urlVal,
			Indexes: []models.IndexEntry{
				{Provider: "garuda", Tier: "Garuda/Lokal"},
			},
			ContentType: contentType,
		}

		sources = append(sources, source)
	}

	return sources, nil
}
