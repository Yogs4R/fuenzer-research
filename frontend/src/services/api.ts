import axios from 'axios';
import type { ResearchRequest, ResearchResponse } from '../types/research';

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

export default api;
