package openalex

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"fuenzer-research/backend/internal/models"
)

const (
	baseURL             = "https://api.openalex.org/works"
	autocompleteBaseURL = "https://api.openalex.org/autocomplete/works"
	defaultLimit        = 5
	requestTimeout      = 8 * time.Second
	mailto              = "fuenzerofficial@gmail.com"
)

// Client handles communication with the OpenAlex API.
type Client struct {
	httpClient *http.Client
}

// NewClient creates a new OpenAlex API client with an 8s timeout.
func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: requestTimeout,
		},
	}
}

// Search queries OpenAlex. If scope is "indonesia", it appends
// locale keywords to the query per api-flow.md rules.
// workType can be "article", "book", "journal", or "" for all types.
func (c *Client) Search(query string, scope string, workType string) ([]models.OpenAlexWork, error) {
	if workType == "" {
		// Concurrently fetch 5 articles, 5 journals, and 5 books, then merge and deduplicate
		type result struct {
			works []models.OpenAlexWork
			err   error
		}
		ch := make(chan result, 3)
		types := []string{"article", "journal", "book"}

		for _, t := range types {
			go func(wt string) {
				works, err := c.searchWithLimit(query, scope, wt, 5)
				ch <- result{works: works, err: err}
			}(t)
		}

		var combined []models.OpenAlexWork
		var firstErr error
		seen := make(map[string]bool)

		for i := 0; i < 3; i++ {
			res := <-ch
			if res.err != nil && firstErr == nil {
				firstErr = res.err
			}
			for _, w := range res.works {
				if !seen[w.ID] {
					seen[w.ID] = true
					combined = append(combined, w)
				}
			}
		}

		// Return combined works if we got any, otherwise return error
		if len(combined) == 0 && firstErr != nil {
			return nil, firstErr
		}
		return combined, nil
	}

	return c.searchWithLimit(query, scope, workType, defaultLimit)
}

// searchWithLimit is the internal search implementation with configurable result limit.
func (c *Client) searchWithLimit(query string, scope string, workType string, limit int) ([]models.OpenAlexWork, error) {
	searchQuery := query
	if scope == "indonesia" {
		if workType == "book" {
			searchQuery = "Indonesia"
		}
	}

	params := url.Values{}
	params.Set("search", searchQuery)
	params.Set("per-page", fmt.Sprintf("%d", limit))
	params.Set("mailto", mailto)

	// Apply type and scope filters dynamically
	var filterParts []string
	if workType != "" {
		switch workType {
		case "article":
			filterParts = append(filterParts, "type:article")
		case "book":
			filterParts = append(filterParts, "type:book", "title.search:"+query)
		case "journal":
			// "Journals" = articles published in journal sources
			filterParts = append(filterParts, "primary_location.source.type:journal")
		}
	}

	if scope == "indonesia" {
		filterParts = append(filterParts, "institutions.country_code:ID")
	}

	if len(filterParts) > 0 {
		params.Set("filter", strings.Join(filterParts, ","))
	}

	reqURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("openalex request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("openalex returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var searchResp models.OpenAlexSearchResponse
	if err := json.Unmarshal(body, &searchResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return searchResp.Results, nil
}

// AutocompleteResult represents a single suggestion from OpenAlex autocomplete.
type AutocompleteResult struct {
	DisplayName string `json:"display_name"`
}

// AutocompleteResponse is the top-level response from OpenAlex autocomplete.
type AutocompleteResponse struct {
	Results []AutocompleteResult `json:"results"`
}

// Autocomplete fetches search suggestions from the OpenAlex autocomplete API.
// Returns up to 5 display_name suggestions for "Did you mean?" functionality.
func (c *Client) Autocomplete(query string) ([]string, error) {
	params := url.Values{}
	params.Set("q", query)
	params.Set("mailto", mailto)

	reqURL := fmt.Sprintf("%s?%s", autocompleteBaseURL, params.Encode())

	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("openalex autocomplete request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("openalex autocomplete returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read autocomplete response: %w", err)
	}

	var autoResp AutocompleteResponse
	if err := json.Unmarshal(body, &autoResp); err != nil {
		return nil, fmt.Errorf("failed to parse autocomplete response: %w", err)
	}

	// Extract display names (limit to 5)
	suggestions := make([]string, 0, 5)
	for i, r := range autoResp.Results {
		if i >= 5 {
			break
		}
		if r.DisplayName != "" {
			suggestions = append(suggestions, r.DisplayName)
		}
	}

	return suggestions, nil
}

// DecodeAbstract reconstructs the abstract string from the OpenAlex abstract_inverted_index.
func DecodeAbstract(invertedIndex map[string][]int) string {
	if len(invertedIndex) == 0 {
		return ""
	}

	maxIdx := -1
	for _, positions := range invertedIndex {
		for _, pos := range positions {
			if pos > maxIdx {
				maxIdx = pos
			}
		}
	}

	if maxIdx == -1 {
		return ""
	}

	words := make([]string, maxIdx+1)
	for word, positions := range invertedIndex {
		for _, pos := range positions {
			words[pos] = word
		}
	}

	// Filter out any empty strings that might have resulted from gaps in indices
	var result []string
	for _, w := range words {
		if w != "" {
			result = append(result, w)
		}
	}

	return strings.Join(result, " ")
}

// OpenAlexSourceItem represents a single journal source returned by the OpenAlex Sources API.
type OpenAlexSourceItem struct {
	ID                   string   `json:"id"`
	DisplayName          string   `json:"display_name"`
	ISSN                 []string `json:"issn"`
	HomepageURL          string   `json:"homepage_url"`
	WorksCount           int      `json:"works_count"`
	HostOrganizationName string   `json:"host_organization_name"`
	Type                 string   `json:"type"`
	Topics               []struct {
		DisplayName string `json:"display_name"`
	} `json:"topics"`
}

// OpenAlexSourcesResponse is the response wrapper from OpenAlex Sources API.
type OpenAlexSourcesResponse struct {
	Results []OpenAlexSourceItem `json:"results"`
}

// SearchSources queries the OpenAlex Sources API specifically for journal publications.
// Filters by country_code:ID if the scope is indonesia.
func (c *Client) SearchSources(query string, scope string, limit int) ([]models.AcademicSource, error) {
	params := url.Values{}
	params.Set("search", query)
	params.Set("per-page", fmt.Sprintf("%d", limit))
	params.Set("mailto", mailto)

	// Filter by type:journal and optionally country_code:ID for Indonesian scope
	if scope == "indonesia" {
		params.Set("filter", "type:journal,country_code:ID")
	} else {
		params.Set("filter", "type:journal")
	}

	reqURL := fmt.Sprintf("https://api.openalex.org/sources?%s", params.Encode())

	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("openalex sources request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("openalex sources returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read sources response body: %w", err)
	}

	var sourcesResp OpenAlexSourcesResponse
	if err := json.Unmarshal(body, &sourcesResp); err != nil {
		return nil, fmt.Errorf("failed to parse sources response: %w", err)
	}

	var results []models.AcademicSource
	for _, item := range sourcesResp.Results {
		if !strings.Contains(strings.ToLower(item.DisplayName), strings.ToLower(query)) {
			continue
		}
		// Map topics to subject areas
		var subjects []string
		for _, t := range item.Topics {
			if t.DisplayName != "" {
				subjects = append(subjects, t.DisplayName)
			}
		}

		subjectText := "Sektor Subjek: tidak ditentukan"
		if len(subjects) > 0 {
			subjectText = "Sektor Subjek: " + strings.Join(subjects, ", ")
		}

		publisher := item.HostOrganizationName
		if publisher == "" {
			publisher = "Penerbit Jurnal Global"
		}

		issnVal := "Tidak tersedia"
		if len(item.ISSN) > 0 {
			issnVal = strings.Join(item.ISSN, ", ")
		}

		abstractText := fmt.Sprintf("Jurnal terindeks global (%s). ISSN: %s. %s. Total publikasi: %d.", 
			item.Type, issnVal, subjectText, item.WorksCount)

		urlVal := item.HomepageURL
		if urlVal == "" {
			urlVal = item.ID
		}

		source := models.AcademicSource{
			ID:          item.ID,
			Title:       item.DisplayName,
			Authors:     []string{}, // Journals have no author lists
			Year:        2025,       // Database current reference year
			Publisher:   publisher,
			Abstract:    abstractText,
			URL:         urlVal,
			Indexes: []models.IndexEntry{
				{Provider: "openalex", Tier: "Global"},
			},
			ContentType: "journal",
		}

		results = append(results, source)
	}

	return results, nil
}

