package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

func main() {
	log.Println("🚀 Starting FTS5 migration for Garuda database...")

	// Find db path
	dbPath := filepath.Join("data", "garuda_articles_data.db")
	if _, err := os.Stat(dbPath); err != nil {
		// Try running from backend folder parent or check alternative path
		dbPath = filepath.Join("..", "data", "garuda_articles_data.db")
		if _, err := os.Stat(dbPath); err != nil {
			log.Fatalf("❌ Database not found! Run this script from the 'backend' directory. Error: %v", err)
		}
	}

	absPath, _ := filepath.Abs(dbPath)
	log.Printf("📂 Target database: %s", absPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("❌ Failed to open SQLite database: %v", err)
	}
	defer db.Close()

	// 1. Drop old FTS table if exists to prevent duplicates
	log.Println("1. Dropping old FTS table if exists...")
	_, err = db.Exec("DROP TABLE IF EXISTS artikel_fts;")
	if err != nil {
		log.Fatalf("❌ Failed to drop virtual table: %v", err)
	}

	// 2. Create FTS5 virtual table
	log.Println("2. Creating FTS5 virtual table 'artikel_fts'...")
	createTableSQL := `
	CREATE VIRTUAL TABLE artikel_fts USING fts5(
		article_title,
		title,
		article_abstract,
		content='artikel',
		content_rowid='id'
	);`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("❌ Failed to create virtual table: %v", err)
	}
	log.Println("✅ Virtual table created successfully.")

	// 3. Populate FTS5 table from existing artikel table
	log.Println("3. Building search index (this may take a few seconds)...")
	start := time.Now()
	populateSQL := `
	INSERT INTO artikel_fts(rowid, article_title, title, article_abstract)
	SELECT id, article_title, title, article_abstract FROM artikel;`
	
	_, err = db.Exec(populateSQL)
	if err != nil {
		log.Fatalf("❌ Failed to populate FTS index: %v", err)
	}
	
	log.Printf("✅ Migration completed in %v!", time.Since(start))
	log.Println("🎉 Database is now fully optimized with FTS5 search index.")
}
