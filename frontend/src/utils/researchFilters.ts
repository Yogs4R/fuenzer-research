import type { AcademicSource } from '../types/research';

export type SortOption = 'relevance' | 'newest' | 'oldest' | 'citations' | 'title';

export type FilterIndex =
  | 'All'
  | 'SINTA 1'
  | 'SINTA 2'
  | 'SINTA 3'
  | 'SINTA 4'
  | 'SINTA 5'
  | 'SINTA 6'
  | 'Scopus'
  | 'Garuda';

export const INDEX_FILTERS: FilterIndex[] = [
  'All',
  'SINTA 1',
  'SINTA 2',
  'SINTA 3',
  'SINTA 4',
  'SINTA 5',
  'SINTA 6',
  'Scopus',
  'Garuda',
];

/**
 * Sorts sources by selected sort option.
 */
export function sortSources(sources: AcademicSource[], sort: SortOption): AcademicSource[] {
  const copy = [...sources];
  if (sort === 'newest') return copy.sort((a, b) => b.year - a.year);
  if (sort === 'oldest') return copy.sort((a, b) => a.year - b.year);
  if (sort === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title));
  // 'relevance' and 'citations' are default or sorted by backend APIs
  return copy;
}

/**
 * Filters academic sources based on selected indexes.
 */
export function filterByIndexes(sources: AcademicSource[], filters: Set<FilterIndex>): AcademicSource[] {
  if (filters.has('All') || filters.size === 0) return sources;
  return sources.filter((s) =>
    [...filters].some((f) => {
      if (f === 'Scopus') return s.indexes?.some((i) => i.provider.toLowerCase() === 'scopus');
      if (f === 'Garuda') return s.indexes?.some((i) => i.provider.toLowerCase() === 'garuda');
      const tier = f.split(' ')[1]; // 'SINTA 1' → '1'
      return s.indexes?.some((i) => i.provider.toLowerCase() === 'sinta' && i.tier === tier);
    })
  );
}
