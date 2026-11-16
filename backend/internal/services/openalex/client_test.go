package openalex

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

type rewriteHostTransport struct {
	target *url.URL
	rt     http.RoundTripper
}

func (t *rewriteHostTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	cloned := req.Clone(req.Context())
	cloned.URL.Scheme = t.target.Scheme
	cloned.URL.Host = t.target.Host
	return t.rt.RoundTrip(cloned)
}

func TestDecodeAbstract(t *testing.T) {
	inverted := map[string][]int{
		"Climate": {0},
		"change":  {1},
		"impacts": {2},
		"crops":   {3},
	}
	if got := DecodeAbstract(inverted); got != "Climate change impacts crops" {
		t.Errorf("DecodeAbstract = %q, want %q", got, "Climate change impacts crops")
	}
	if got := DecodeAbstract(nil); got != "" {
		t.Errorf("DecodeAbstract(nil) = %q, want empty", got)
	}
}

func TestClientPropagatesAPIKeyAndAPIError(t *testing.T) {
	var seenAPIKey string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seenAPIKey = r.URL.Query().Get("api_key")
		if r.URL.Query().Get("search") == "rate-limited" {
			w.WriteHeader(http.StatusTooManyRequests)
			_, _ = w.Write([]byte(`{"error":"budget exhausted"}`))
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"results":[{"id":"W1","title":"Paper One","type":"article","publication_year":2025}]}`))
	}))
	defer srv.Close()

	targetURL, _ := url.Parse(srv.URL)
	client := &Client{
		httpClient: &http.Client{
			Transport: &rewriteHostTransport{target: targetURL, rt: srv.Client().Transport},
		},
		apiKey: "test-key-123",
	}

	works, err := client.Search("agriculture", "global", "article")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(works) != 1 || works[0].Title != "Paper One" {
		t.Fatalf("unexpected works: %+v", works)
	}
	if seenAPIKey != "test-key-123" {
		t.Errorf("api_key query param = %q, want test-key-123", seenAPIKey)
	}

	_, err = client.Search("rate-limited", "global", "article")
	var apiErr *APIError
	if !errors.As(err, &apiErr) || apiErr.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("expected APIError 429, got %v", err)
	}
}
