package firebase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"fuenzer-research/backend/internal/config"
)

type Client struct {
	apiKey string
	client *http.Client
}

func NewClient(cfg *config.Config) (*Client, error) {
	if cfg.FirebaseAPIKey == "" {
		return nil, fmt.Errorf("FIREBASE_API_KEY is not configured in backend env")
	}
	return &Client{
		apiKey: cfg.FirebaseAPIKey,
		client: &http.Client{Timeout: 10 * time.Second},
	}, nil
}

type SendOobCodeRequest struct {
	RequestType   string `json:"requestType"`
	Email         string `json:"email"`
	ReturnOobLink bool   `json:"returnOobLink"`
}

type FirebaseErrorDetails struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type SendOobCodeResponse struct {
	Email   string                `json:"email"`
	OobLink string                `json:"oobLink"`
	Error   *FirebaseErrorDetails `json:"error,omitempty"`
}

func (c *Client) GeneratePasswordResetLink(ctx context.Context, email string) (string, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=%s", c.apiKey)

	reqBody := SendOobCodeRequest{
		RequestType:   "PASSWORD_RESET",
		Email:         email,
		ReturnOobLink: true,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to perform request: %w", err)
	}
	defer resp.Body.Close()

	// Firebase REST API returns error codes in HTTP status for non-200 responses
	if resp.StatusCode != http.StatusOK {
		var errRes struct {
			Error *FirebaseErrorDetails `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errRes); err == nil && errRes.Error != nil {
			return "", fmt.Errorf("firebase auth error: %s (code %d)", errRes.Error.Message, errRes.Error.Code)
		}
		return "", fmt.Errorf("firebase auth error with status code: %d", resp.StatusCode)
	}

	var res SendOobCodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if res.Error != nil {
		return "", fmt.Errorf("firebase auth error: %s (code %d)", res.Error.Message, res.Error.Code)
	}

	if res.OobLink == "" {
		return "", fmt.Errorf("no oobLink returned from Firebase API")
	}

	return res.OobLink, nil
}

func (c *Client) GenerateEmailVerificationLink(ctx context.Context, email string) (string, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=%s", c.apiKey)

	reqBody := SendOobCodeRequest{
		RequestType:   "VERIFY_EMAIL",
		Email:         email,
		ReturnOobLink: true,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to perform request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errRes struct {
			Error *FirebaseErrorDetails `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errRes); err == nil && errRes.Error != nil {
			return "", fmt.Errorf("firebase auth error: %s (code %d)", errRes.Error.Message, errRes.Error.Code)
		}
		return "", fmt.Errorf("firebase auth error with status code: %d", resp.StatusCode)
	}

	var res SendOobCodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if res.Error != nil {
		return "", fmt.Errorf("firebase auth error: %s (code %d)", res.Error.Message, res.Error.Code)
	}

	if res.OobLink == "" {
		return "", fmt.Errorf("no oobLink returned from Firebase API")
	}

	return res.OobLink, nil
}

