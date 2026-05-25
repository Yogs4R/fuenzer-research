package gemini

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"fuenzer-research/backend/internal/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

const (
	modelName      = "gemini-3.1-flash-lite"
	temperature    = 0.3
	requestTimeout = 15 * time.Second
)

// Client handles communication with the Google Gemini API.
type Client struct {
	apiKey string
}

// NewClient creates a new Gemini client.
func NewClient(apiKey string) *Client {
	return &Client{apiKey: apiKey}
}

// buildPrompt constructs the synthesis prompt per AGENTS.md specifications.
// Only Title, Abstract, and Year are included (token economy).
func buildPrompt(query string, papers []models.AcademicSource) string {
	abstracts := make([]models.GeminiAbstract, 0, len(papers))
	for _, p := range papers {
		abstracts = append(abstracts, models.GeminiAbstract{
			Title:    p.Title,
			Abstract: p.Abstract,
			Year:     p.Year,
		})
	}

	jsonData, _ := json.MarshalIndent(abstracts, "", "  ")

	return fmt.Sprintf(`Anda adalah Fuenzer Synthesis Engine, asisten riset akademis yang sangat ketat dan objektif.

TUGAS ANDA:
Buatlah SATU paragraf sintesis (maksimal 150 kata) yang menjawab Query Pengguna secara komprehensif, HANYA berdasarkan pada Abstrak Jurnal yang disediakan di bawah ini.

ATURAN KETAT:
1. DILARANG menggunakan pengetahuan eksternal. Jika jawaban tidak ada di abstrak yang diberikan, nyatakan: "Literatur yang ditemukan tidak cukup untuk menyimpulkan hal ini."
2. Tulis dalam bahasa Indonesia yang baku dan akademis.
3. Jangan pernah menulis kalimat pengantar seperti "Berikut adalah sintesisnya..." Langsung ke poin utama.
4. Gunakan format Markdown jika diperlukan (seperti **bold** untuk istilah penting), tetapi jangan gunakan heading.

QUERY PENGGUNA:
"%s"

DATA ABSTRAK JURNAL:
%s`, query, string(jsonData))
}

// Synthesize generates an AI synthesis from the given papers using Gemini.
func (c *Client) Synthesize(query string, papers []models.AcademicSource) (string, error) {
	if len(papers) == 0 {
		return "Tidak ditemukan literatur yang relevan untuk topik ini.", nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), requestTimeout)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(c.apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel(modelName)

	// Hardcode temperature to 0.3 — no hallucinations.
	temp := float32(temperature)
	model.Temperature = &temp

	// Set safety settings to block medium and above
	model.SafetySettings = []*genai.SafetySetting{
		{Category: genai.HarmCategoryHarassment, Threshold: genai.HarmBlockMediumAndAbove},
		{Category: genai.HarmCategoryHateSpeech, Threshold: genai.HarmBlockMediumAndAbove},
		{Category: genai.HarmCategorySexuallyExplicit, Threshold: genai.HarmBlockMediumAndAbove},
		{Category: genai.HarmCategoryDangerousContent, Threshold: genai.HarmBlockMediumAndAbove},
	}

	prompt := buildPrompt(query, papers)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("gemini generation failed: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "Literatur yang ditemukan tidak cukup untuk menyimpulkan hal ini.", nil
	}

	// Extract text from response
	text := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	return text, nil
}
