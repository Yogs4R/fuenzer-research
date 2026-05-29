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
	searchQuery := query
	if scope == "indonesia" {
		searchQuery = query + " Indonesia Universitas"
	}

	params := url.Values{}
	params.Set("search", searchQuery)
	params.Set("per-page", fmt.Sprintf("%d", defaultLimit))
	params.Set("mailto", mailto)

	// Apply type filter if specified
	if workType != "" {
		switch workType {
		case "article":
			params.Set("filter", "type:article")
		case "book":
			params.Set("filter", "type:book")
		case "journal":
			// "Journals" = articles published in journal sources
			params.Set("filter", "primary_location.source.type:journal")
		}
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
