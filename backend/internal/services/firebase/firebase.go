package firebase

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

	"fuenzer-research/backend/internal/config"
)

// Client wraps the Firebase Admin Auth client.
type Client struct {
	auth *auth.Client
}

// NewClient initializes the Firebase Admin SDK.
//
// On Cloud Run, Application Default Credentials (ADC) are used automatically —
// no API key or service account JSON file is needed.
// For local development, set GOOGLE_APPLICATION_CREDENTIALS to a service
// account JSON path, or use `gcloud auth application-default login`.
func NewClient(cfg *config.Config) (*Client, error) {
	ctx := context.Background()

	var app *firebase.App
	var err error

	if cfg.FirebaseProjectID != "" {
		// Explicitly set Project ID if configured (recommended for clarity)
		conf := &firebase.Config{ProjectID: cfg.FirebaseProjectID}
		app, err = firebase.NewApp(ctx, conf)
	} else {
		// Let ADC resolve both credentials and project automatically
		app, err = firebase.NewApp(ctx, nil, option.WithScopes(
			"https://www.googleapis.com/auth/firebase",
			"https://www.googleapis.com/auth/cloud-platform",
		))
	}

	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase Admin app: %w", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase Auth client: %w", err)
	}

	return &Client{auth: authClient}, nil
}

// GenerateEmailVerificationLink generates an email verification link for the
// given email address using the Firebase Admin SDK. This requires the Cloud Run
// service account to have the Firebase Auth Admin IAM role.
func (c *Client) GenerateEmailVerificationLink(ctx context.Context, email string) (string, error) {
	link, err := c.auth.EmailVerificationLink(ctx, email)
	if err != nil {
		return "", fmt.Errorf("firebase admin: failed to generate email verification link: %w", err)
	}
	return link, nil
}

// GeneratePasswordResetLink generates a password reset link for the given
// email address using the Firebase Admin SDK.
func (c *Client) GeneratePasswordResetLink(ctx context.Context, email string) (string, error) {
	link, err := c.auth.PasswordResetLink(ctx, email)
	if err != nil {
		return "", fmt.Errorf("firebase admin: failed to generate password reset link: %w", err)
	}
	return link, nil
}
