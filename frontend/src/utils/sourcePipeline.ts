import type { AcademicSource } from '../types/research';
import {
  type SortOption,
  type FilterIndex,
  sortSources,
  filterByIndexes,
} from './researchFilters';

export type ContentTypeFilter = 'All' | 'Articles' | 'Journals' | 'Books';

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  relevance: 'Most Relevant',
  newest: 'Newest First',
  oldest: 'Oldest First',
  citations: 'Most Cited',
  title: 'Title (A-Z)',
};

export function toggleIndexFilterValue(prev: Set<FilterIndex>, target: FilterIndex): Set<FilterIndex> {
  if (target === 'All') {
    return new Set<FilterIndex>(['All']);
  }
  const next = new Set(prev);
  next.delete('All');
  if (next.has(target)) {
    next.delete(target);
    if (next.size === 0) next.add('All');
  } else {
    next.add(target);
  }
  return next;
}

export function filterAndSortSources(
  sources: AcademicSource[],
  options: {
    contentType: ContentTypeFilter;
    indexFilters?: Set<FilterIndex>;
    searchQuery?: string;
    sort: SortOption;
  }
): AcademicSource[] {
  const { contentType, indexFilters, searchQuery, sort } = options;

  const afterType =
    contentType === 'All'
      ? sources
      : sources.filter((s) => {
          const ct = s.content_type?.toLowerCase() || '';
          switch (contentType) {
            case 'Articles':
              return ct === 'article' || ct === 'journal-article';
            case 'Journals':
              return ct === 'journal' || ct === 'journal-article';
            case 'Books':
              return ct === 'book' || ct === 'book-chapter';
          }
        });

  const afterIndex = indexFilters ? filterByIndexes(afterType, indexFilters) : afterType;

  const trimmed = searchQuery?.trim().toLowerCase() || '';
  const afterSearch = trimmed
    ? afterIndex.filter(
        (s) =>
          s.title.toLowerCase().includes(trimmed) ||
          (s.authors || []).join(' ').toLowerCase().includes(trimmed) ||
          (s.publisher && s.publisher.toLowerCase().includes(trimmed))
      )
    : afterIndex;

  return sortSources(afterSearch, sort);
}

export function downloadTextFile(content: string, filename: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
