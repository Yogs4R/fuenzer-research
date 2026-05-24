package models

// ResearchRequest represents the incoming search request from the frontend.
type ResearchRequest struct {
	Query string `json:"query" validate:"required,min=3,max=200"`
	Scope string `json:"scope" validate:"required,oneof=global indonesia"`
}

// IndexEntry represents a single index/tier assignment for a journal.
type IndexEntry struct {
	Provider string `json:"provider"`
	Tier     string `json:"tier"`
}

// AcademicSource represents a single journal/paper reference in the response.
type AcademicSource struct {
	ID        string       `json:"id"`
	Title     string       `json:"title"`
	Authors   []string     `json:"authors"`
	Year      int          `json:"year"`
	Publisher string       `json:"publisher"`
	Abstract  string       `json:"abstract,omitempty"`
	Indexes   []IndexEntry `json:"indexes"`
	URL       string       `json:"url"`
}

// ResearchResponse is the unified response sent back to the frontend.
type ResearchResponse struct {
	Synthesis  string           `json:"synthesis"`
	References []AcademicSource `json:"references"`
	LatencyMs  int64            `json:"latency_ms"`
}

// ScholarPaper represents a paper returned from the Semantic Scholar API.
type ScholarPaper struct {
	PaperId       string `json:"paperId"`
	Title         string `json:"title"`
	Abstract      string `json:"abstract"`
	Year          int    `json:"year"`
	URL           string `json:"url"`
	Venue         string `json:"venue"`
	Journal       *ScholarJournal `json:"journal"`
	Authors       []ScholarAuthor `json:"authors"`
	ExternalIds   map[string]interface{} `json:"externalIds"`
}

// ScholarJournal represents journal info from Semantic Scholar.
type ScholarJournal struct {
	Name   string `json:"name"`
	Volume string `json:"volume"`
	Pages  string `json:"pages"`
}

// ScholarAuthor represents an author from Semantic Scholar.
type ScholarAuthor struct {
	AuthorId string `json:"authorId"`
	Name     string `json:"name"`
}

// ScholarSearchResponse is the top-level response from Semantic Scholar search.
type ScholarSearchResponse struct {
	Total  int            `json:"total"`
	Offset int            `json:"offset"`
	Next   int            `json:"next"`
	Data   []ScholarPaper `json:"data"`
}

// SintaJournal represents a single entry in our local SINTA dictionary.
type SintaJournal struct {
	Publisher string `json:"publisher"`
	Tier      string `json:"tier"`
	Field     string `json:"field"`
}

// GeminiAbstract is the lean struct sent to Gemini (token economy).
type GeminiAbstract struct {
	Title    string `json:"title"`
	Abstract string `json:"abstract"`
	Year     int    `json:"year"`
}
