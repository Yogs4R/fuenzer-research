package sinta

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"

	"fuenzer-research/backend/internal/models"
)

// Mapper handles the local SINTA journal dictionary lookup.
type Mapper struct {
	journals map[string]models.SintaJournal // key: lowercased publisher name
	mu       sync.RWMutex
}

var (
	instance *Mapper
	once     sync.Once
)

// GetMapper returns the singleton SINTA mapper instance.
// It loads sinta_data.json on first call.
func GetMapper(dataPath string) (*Mapper, error) {
	var initErr error
	once.Do(func() {
		instance = &Mapper{
			journals: make(map[string]models.SintaJournal),
		}
		initErr = instance.loadData(dataPath)
	})
	if initErr != nil {
		return nil, initErr
	}
	return instance, nil
}

// loadData reads and parses the sinta_journals_data.json file.
func (m *Mapper) loadData(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read SINTA data file: %w", err)
	}

	type SintaJournalsRoot struct {
		Journals []struct {
			BasicInfo struct {
				Name          string `json:"name"`
				Institution   string `json:"institution"`
				Accreditation string `json:"accreditation"`
				Url           string `json:"url"`
				SubjectArea   string `json:"subject_area"`
				Identifiers   struct {
					PIssn string `json:"p_issn"`
				} `json:"identifiers"`
			} `json:"basic_info"`
		} `json:"journals"`
	}

	var root SintaJournalsRoot
	if err := json.Unmarshal(data, &root); err != nil {
		return fmt.Errorf("failed to parse SINTA data: %w", err)
	}

	m.mu.Lock()
	defer m.mu.Unlock()
	for _, j := range root.Journals {
		name := strings.TrimSpace(j.BasicInfo.Name)
		if name == "" {
			continue
		}

		accred := j.BasicInfo.Accreditation // e.g. "Sinta 3" or "S1"
		tier := ""
		// Robustly extract the first digit between 1 and 6
		for _, r := range accred {
			if r >= '1' && r <= '6' {
				tier = string(r)
				break
			}
		}

		key := strings.ToLower(name)
		m.journals[key] = models.SintaJournal{
			Publisher:   name,
			Tier:        tier,
			Field:       j.BasicInfo.Institution,
			SubjectArea: j.BasicInfo.SubjectArea,
			ISSN:        j.BasicInfo.Identifiers.PIssn,
			URL:         j.BasicInfo.Url,
		}
	}
	return nil
}

// LookupTier checks if a publisher name exists in the SINTA dictionary.
// Returns the IndexEntry with provider "sinta" and the matched tier,
// or provider "garuda" with tier "Garuda/Lokal" if no match.
func (m *Mapper) LookupTier(publisher string) models.IndexEntry {
	m.mu.RLock()
	defer m.mu.RUnlock()

	key := strings.ToLower(strings.TrimSpace(publisher))
	if key == "" {
		return models.IndexEntry{
			Provider: "garuda",
			Tier:     "Garuda/Lokal",
		}
	}

	// Try exact match first
	if j, ok := m.journals[key]; ok {
		return models.IndexEntry{
			Provider: "sinta",
			Tier:     j.Tier,
		}
	}

	// Try substring match with tightened constraint to prevent false positives (min 6 characters)
	for dictKey, j := range m.journals {
		if dictKey != "" && len(dictKey) >= 6 && len(key) >= 6 {
			if strings.Contains(key, dictKey) || strings.Contains(dictKey, key) {
				return models.IndexEntry{
					Provider: "sinta",
					Tier:     j.Tier,
				}
			}
		}
	}

	return models.IndexEntry{
		Provider: "garuda",
		Tier:     "Garuda/Lokal",
	}
}

// SearchJournals searches the local SINTA database directly using keyword queries.
// Matches against journal name, institution, or subject areas.
func (m *Mapper) SearchJournals(query string, sintaRanks []string, limit int) []models.AcademicSource {
	m.mu.RLock()
	defer m.mu.RUnlock()

	queryLower := strings.ToLower(strings.TrimSpace(query))
	var results []models.AcademicSource

	// Filter rank helpers
	hasRankFilter := len(sintaRanks) > 0 && !containsAll(sintaRanks)

	for _, j := range m.journals {
		// Keyword matching specifically against Title (Publisher in struct represents journal name)
		nameMatch := strings.Contains(strings.ToLower(j.Publisher), queryLower)

		if nameMatch {
			// Apply tier filter if requested
			if hasRankFilter {
				matchTierFound := false
				for _, rank := range sintaRanks {
					normRank := strings.TrimSpace(strings.ReplaceAll(strings.ToLower(rank), "sinta", ""))
					if normRank == j.Tier {
						matchTierFound = true
						break
					}
				}
				if !matchTierFound {
					continue
				}
			}

			// Map SINTA journal info to AcademicSource structure
			idVal := fmt.Sprintf("sinta-%s", j.ISSN)
			if j.ISSN == "" {
				// Fallback to name-based ID
				sanitized := strings.Map(func(r rune) rune {
					if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
						return r
					}
					return '-'
				}, j.Publisher)
				idVal = fmt.Sprintf("sinta-%s", strings.ToLower(sanitized))
			}

			abstractText := fmt.Sprintf("Jurnal terakreditasi Sinta %s bidang %s. Diterbitkan oleh %s.", j.Tier, j.SubjectArea, j.Field)

			urlVal := j.URL
			if urlVal == "" {
				urlVal = "https://sinta.kemdiktisaintek.go.id"
			}

			source := models.AcademicSource{
				ID:          idVal,
				Title:       j.Publisher,
				Authors:     []string{}, // Journals have no authors, they are publications
				Year:        2025,       // Current database version year
				Publisher:   j.Field,
				Abstract:    abstractText,
				URL:         urlVal,
				Indexes: []models.IndexEntry{
					{Provider: "SINTA", Tier: j.Tier},
				},
				ContentType: "journal",
			}

			results = append(results, source)
			if len(results) >= limit {
				break
			}
		}
	}

	return results
}

// containsAll checks if Sinta rank slice has "all"
func containsAll(slice []string) bool {
	for _, s := range slice {
		if strings.ToLower(strings.TrimSpace(s)) == "all" {
			return true
		}
	}
	return false
}

// MapPapers enriches a slice of AcademicSource with SINTA index data.
func (m *Mapper) MapPapers(sources []models.AcademicSource) []models.AcademicSource {
	for i := range sources {
		tier := m.LookupTier(sources[i].Publisher)
		sources[i].Indexes = []models.IndexEntry{tier}
	}
	return sources
}

