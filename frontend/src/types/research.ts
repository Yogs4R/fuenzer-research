// TypeScript interfaces matching backend JSON responses exactly.
// Per project-context.md: `any` type is strictly forbidden.

export interface IndexEntry {
  provider: string;
  tier: string;
}

export interface AcademicSource {
  id: string;
  title: string;
  authors: string[];
  year: number;
  publisher: string;
  indexes: IndexEntry[];
  url: string;
  content_type?: string; // "article", "book", "book-chapter", etc.
}

export interface ResearchResponse {
  synthesis: string;
  references: AcademicSource[];
  latency_ms: number;
}

export interface ResearchRequest {
  query: string;
  scope: 'global' | 'indonesia';
  type?: 'article' | 'book' | 'journal' | ''; // content type filter
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export type SearchScope = 'global' | 'indonesia';

export type ContentType = 'All' | 'Articles' | 'Journals' | 'Books';

export type LoadingPhase =
  | 'idle'
  | 'searching'
  | 'filtering'
  | 'synthesizing'
  | 'complete'
  | 'error';
