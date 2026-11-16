package sinta

import (
	"testing"

	"fuenzer-research/backend/internal/models"
)

func newTestMapper() *Mapper {
	return &Mapper{
		journals: map[string]models.SintaJournal{
			"jurnal teknologi pertanian": {
				Publisher:   "Jurnal Teknologi Pertanian",
				Tier:        "2",
				Field:       "Universitas Brawijaya",
				SubjectArea: "Agriculture",
				ISSN:        "1411-5131",
				URL:         "https://jtp.ub.ac.id",
			},
			"jurnal ekonomi pembangunan": {
				Publisher:   "Jurnal Ekonomi Pembangunan",
				Tier:        "3",
				Field:       "Universitas Muhammadiyah Surakarta",
				SubjectArea: "Economics",
				ISSN:        "1411-6081",
			},
		},
		articles: []models.AcademicSource{
			{
				ID:          "sinta-art-1",
				Title:       "Impact of Climate Change on Indonesian Agriculture",
				Publisher:   "Jurnal Teknologi Pertanian",
				Year:        2024,
				Indexes:     []models.IndexEntry{{Provider: "SINTA", Tier: "2"}},
				ContentType: "article",
			},
			{
				ID:          "sinta-art-2",
				Title:       "Monetary Policy Transmission",
				Publisher:   "Jurnal Ekonomi Pembangunan",
				Year:        2023,
				Indexes:     []models.IndexEntry{{Provider: "SINTA", Tier: "3"}},
				ContentType: "article",
			},
		},
	}
}

func TestSearchArticlesMultiWordAndRankFilter(t *testing.T) {
	m := newTestMapper()

	// Non-contiguous words in title must match
	got := m.SearchArticles("climate agriculture", nil, 10)
	if len(got) != 1 || got[0].ID != "sinta-art-1" {
		t.Fatalf("expected 1 match for multi-word query, got %+v", got)
	}

	// Rank mismatch filters out result
	gotFiltered := m.SearchArticles("climate agriculture", []string{"SINTA 1"}, 10)
	if len(gotFiltered) != 0 {
		t.Fatalf("expected 0 matches for SINTA 1 filter, got %+v", gotFiltered)
	}

	// Matching rank includes result
	gotMatch := m.SearchArticles("climate agriculture", []string{"SINTA 2"}, 10)
	if len(gotMatch) != 1 {
		t.Fatalf("expected 1 match for SINTA 2 filter, got %+v", gotMatch)
	}
}

func TestSearchJournalsAndLookupTier(t *testing.T) {
	m := newTestMapper()

	journals := m.SearchJournals("pertanian brawijaya", []string{"All"}, 10)
	if len(journals) != 1 || journals[0].Title != "Jurnal Teknologi Pertanian" {
		t.Fatalf("expected 1 journal match across title+field tokens, got %+v", journals)
	}

	if entry := m.LookupTier("Jurnal Teknologi Pertanian"); entry.Provider != "sinta" || entry.Tier != "2" {
		t.Errorf("LookupTier exact = %+v, want sinta/2", entry)
	}
	if entry := m.LookupTier("Unknown Local Journal"); entry.Provider != "garuda" {
		t.Errorf("LookupTier fallback = %+v, want garuda", entry)
	}
}
