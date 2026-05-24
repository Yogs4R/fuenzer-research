package scholar

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"fuenzer-research/backend/internal/models"
)

const (
	baseURL       = "https://api.semanticscholar.org/graph/v1/paper/search"
	defaultLimit  = 5
	requestTimeout = 8 * time.Second
	fields        = "paperId,title,abstract,year,url,venue,journal,authors,externalIds"
)

// Client handles communication with the Semantic Scholar API.
type Client struct {
	httpClient *http.Client
}

// NewClient creates a new Semantic Scholar API client with an 8s timeout.
func NewClient() *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: requestTimeout,
		},
	}
}

// Search queries Semantic Scholar. If scope is "indonesia", it appends
// locale keywords to the query per api-flow.md rules.
func (c *Client) Search(query string, scope string) ([]models.ScholarPaper, error) {
	searchQuery := query
	if scope == "indonesia" {
		searchQuery = query + " AND (Indonesia OR Universitas)"
	}

	params := url.Values{}
	params.Set("query", searchQuery)
	params.Set("limit", fmt.Sprintf("%d", defaultLimit))
	params.Set("fields", fields)

	reqURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	resp, err := c.httpClient.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("semantic scholar request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("semantic scholar returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var searchResp models.ScholarSearchResponse
	if err := json.Unmarshal(body, &searchResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return searchResp.Data, nil
}
