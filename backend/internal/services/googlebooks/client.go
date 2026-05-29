package googlebooks

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"fuenzer-research/backend/internal/models"
)

const (
	apiURL         = "https://www.googleapis.com/books/v1/volumes"
	requestTimeout = 8 * time.Second
)

// Client handles communication with the Google Books API.
type Client struct {
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new Google Books client.
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: requestTimeout,
		},
	}
}

// GoogleBooksResponse is the JSON schema returned by the Google Books API.
type GoogleBooksResponse struct {
	Items []struct {
		ID         string `json:"id"`
		VolumeInfo struct {
			Title               string   `json:"title"`
			Authors             []string `json:"authors"`
			Publisher           string   `json:"publisher"`
			PublishedDate       string   `json:"publishedDate"`
			InfoLink            string   `json:"infoLink"`
			Description         string   `json:"description"`
			IndustryIdentifiers []struct {
				Type       string `json:"type"`
				Identifier string `json:"identifier"`
			} `json:"industryIdentifiers"`
		} `json:"volumeInfo"`
	} `json:"items"`
}

// Search queries the Google Books API for books matching the query.
func (c *Client) Search(query string, scope string, limit int) ([]models.AcademicSource, error) {
	if c.apiKey == "" {
		return nil, fmt.Errorf("Google Books API key is missing")
	}

	params := url.Values{}
	params.Set("q", "intitle:"+query)
	params.Set("maxResults", fmt.Sprintf("%d", limit))
	params.Set("key", c.apiKey)
	if scope == "indonesia" {
		params.Set("langRestrict", "id")
	}

	reqURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())

	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("google books request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google books returned status %d", resp.StatusCode)
	}

	var bookResp GoogleBooksResponse
	if err := json.NewDecoder(resp.Body).Decode(&bookResp); err != nil {
		return nil, fmt.Errorf("failed to parse google books response: %w", err)
	}

	var sources []models.AcademicSource
	for _, item := range bookResp.Items {
		// Extract Year from publishedDate (e.g. "2020-05-12" -> 2020, or "2020" -> 2020)
		year := 0
		if len(item.VolumeInfo.PublishedDate) >= 4 {
			fmt.Sscanf(item.VolumeInfo.PublishedDate[:4], "%d", &year)
		}

		publisher := item.VolumeInfo.Publisher
		if publisher == "" {
			publisher = "Google Books"
		}

		// Find ISBN or set URL
		urlVal := item.VolumeInfo.InfoLink
		var isbn string
		for _, ident := range item.VolumeInfo.IndustryIdentifiers {
			if strings.HasPrefix(ident.Type, "ISBN") {
				isbn = ident.Identifier
				break
			}
		}

		// If there is an ISBN, we can represent it or use the standard URL
		if isbn != "" && urlVal == "" {
			urlVal = "https://isbnsearch.org/isbn/" + isbn
		}

		if !strings.Contains(strings.ToLower(item.VolumeInfo.Title), strings.ToLower(query)) {
			continue
		}

		source := models.AcademicSource{
			ID:          "googlebooks-" + item.ID,
			Title:       item.VolumeInfo.Title,
			Authors:     item.VolumeInfo.Authors,
			Year:        year,
			Publisher:   publisher,
			Abstract:    item.VolumeInfo.Description,
			URL:         urlVal,
			Indexes: []models.IndexEntry{
				{Provider: "googlebooks", Tier: "Google Books"},
			},
			ContentType: "book",
		}
		if scope == "indonesia" {
			source.Indexes = append(source.Indexes, models.IndexEntry{Provider: "location", Tier: "Indonesia"})
		}

		// Handle empty authors gracefully in case of missing authors
		if len(source.Authors) == 0 {
			source.Authors = []string{}
		}

		sources = append(sources, source)
	}

	return sources, nil
}
