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

// OpenAlexWork represents a paper returned from the OpenAlex API.
type OpenAlexWork struct {
	ID                    string               `json:"id"`
	Title                 string               `json:"title"`
	PublicationYear       int                  `json:"publication_year"`
	PrimaryLocation       *OpenAlexLocation    `json:"primary_location"`
	Authorships           []OpenAlexAuthorship `json:"authorships"`
	AbstractInvertedIndex map[string][]int     `json:"abstract_inverted_index"`
}

// OpenAlexLocation represents the primary location of the work.
type OpenAlexLocation struct {
	Source         *OpenAlexSource `json:"source"`
	LandingPageURL string          `json:"landing_page_url"`
}

// OpenAlexSource represents the source (journal/publisher) of the work.
type OpenAlexSource struct {
	DisplayName string `json:"display_name"`
}

// OpenAlexAuthorship represents an authorship entry.
type OpenAlexAuthorship struct {
	Author OpenAlexAuthor `json:"author"`
}

// OpenAlexAuthor represents the author's details.
type OpenAlexAuthor struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
}

// OpenAlexSearchResponse is the top-level response from OpenAlex search.
type OpenAlexSearchResponse struct {
	Meta struct {
		Count   int `json:"count"`
		PerPage int `json:"per_page"`
		Page    int `json:"page"`
	} `json:"meta"`
	Results []OpenAlexWork `json:"results"`
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
