package garuda

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	"fuenzer-research/backend/internal/config"
	"fuenzer-research/backend/internal/models"

	_ "modernc.org/sqlite"
)

// Client handles local SQLite queries against the garuda_articles_data.db.
type Client struct {
	dbPath string
	db     *sql.DB
}

// NewClient initializes a new Garuda SQLite database client with a pooled connection.
func NewClient() (*Client, error) {
	dbPath := config.ResolveDataFile("garuda_articles_data.db")
	if _, err := os.Stat(dbPath); err != nil {
		return nil, fmt.Errorf("garuda database not found at %s: %w", dbPath, err)
	}
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open garuda SQLite db: %w", err)
	}
	db.SetMaxOpenConns(4)
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("failed to ping garuda SQLite db: %w", err)
	}
	log.Printf("📂 Garuda local database client loaded from %s", dbPath)
	return &Client{dbPath: dbPath, db: db}, nil
}

// Close closes the underlying SQLite connection pool.
func (c *Client) Close() error {
	if c.db != nil {
		return c.db.Close()
	}
	return nil
}

// Search queries the SQLite table `artikel` for matching keyword search.
// It maps the results to modern models.AcademicSource structure.
func (c *Client) Search(query string, workType string) ([]models.AcademicSource, error) {
	if c.db == nil {
		return nil, fmt.Errorf("garuda SQLite db is not initialized")
	}

	// Adjust search limit based on type
	limit := 10
	if workType == "" {
		limit = 30
	}

	// Sanitize and tokenize query for FTS5 MATCH syntax
	words := strings.Fields(query)
	var searchTerms []string
	for _, word := range words {
		cleaned := strings.Map(func(r rune) rune {
			if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
				return r
			}
			return -1
		}, word)
		if cleaned != "" {
			searchTerms = append(searchTerms, cleaned+"*")
		}
	}

	var matchQuery string
	if len(searchTerms) > 0 {
		matchQuery = strings.Join(searchTerms, " AND ")
	} else {
		return nil, nil // return empty results if no valid keywords
	}

	var rows *sql.Rows
	var err error
	if workType == "journal" {
		rows, err = c.db.Query(
			`SELECT a.article_title, a.title, a.article_abstract, a.article_year, a.doi, a.url, a.source
			 FROM artikel_fts f
			 JOIN artikel a ON a.id = f.rowid
			 WHERE f.title MATCH ?
			 LIMIT ?`,
			matchQuery, limit,
		)
	} else {
		rows, err = c.db.Query(
			`SELECT a.article_title, a.title, a.article_abstract, a.article_year, a.doi, a.url, a.source
			 FROM artikel_fts f
			 JOIN artikel a ON a.id = f.rowid
			 WHERE f.artikel_fts MATCH ?
			 LIMIT ?`,
			matchQuery, limit,
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
