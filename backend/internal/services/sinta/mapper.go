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

// loadData reads and parses the sinta_data.json file.
func (m *Mapper) loadData(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read SINTA data file: %w", err)
	}

	var journals []models.SintaJournal
	if err := json.Unmarshal(data, &journals); err != nil {
		return fmt.Errorf("failed to parse SINTA data: %w", err)
	}

	m.mu.Lock()
	defer m.mu.Unlock()
	for _, j := range journals {
		key := strings.ToLower(strings.TrimSpace(j.Publisher))
		m.journals[key] = j
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

	// Try exact match first
	if j, ok := m.journals[key]; ok {
		return models.IndexEntry{
			Provider: "sinta",
			Tier:     j.Tier,
		}
	}

	// Try substring match (publisher name may be part of venue string)
	for dictKey, j := range m.journals {
		if strings.Contains(key, dictKey) || strings.Contains(dictKey, key) {
			return models.IndexEntry{
				Provider: "sinta",
				Tier:     j.Tier,
			}
		}
	}

	return models.IndexEntry{
		Provider: "garuda",
		Tier:     "Garuda/Lokal",
	}
}

// MapPapers enriches a slice of AcademicSource with SINTA index data.
func (m *Mapper) MapPapers(sources []models.AcademicSource) []models.AcademicSource {
	for i := range sources {
		tier := m.LookupTier(sources[i].Publisher)
		sources[i].Indexes = []models.IndexEntry{tier}
	}
	return sources
}
