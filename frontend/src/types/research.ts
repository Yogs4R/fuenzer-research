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
}

export interface ResearchResponse {
  synthesis: string;
  references: AcademicSource[];
  latency_ms: number;
}

export interface ResearchRequest {
  query: string;
  scope: 'global' | 'indonesia';
}

export type SearchScope = 'global' | 'indonesia';

export type LoadingPhase =
  | 'idle'
  | 'searching'
  | 'filtering'
  | 'synthesizing'
  | 'complete'
  | 'error';
