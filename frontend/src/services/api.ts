import axios from 'axios';
import type { ResearchRequest, ResearchResponse, AutocompleteResponse } from '../types/research';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function searchResearch(
  request: ResearchRequest
): Promise<ResearchResponse> {
  const response = await api.post<ResearchResponse>(
    '/api/v1/research',
    request
  );
  return response.data;
}

/**
 * Fetch autocomplete suggestions from OpenAlex via backend.
 * Used for "Did you mean?" functionality.
 * 
 * @param query - The user's search input (minimum 2 chars)
 * @returns Array of suggestion strings
 */
export async function fetchAutocomplete(query: string): Promise<string[]> {
  if (query.length < 2) return [];

  try {
    const response = await api.get<AutocompleteResponse>(
      '/api/v1/autocomplete',
      { params: { q: query }, timeout: 5000 }
    );
    return response.data.suggestions || [];
  } catch {
    // Silently fail — autocomplete is non-critical
    return [];
  }
}

export default api;
