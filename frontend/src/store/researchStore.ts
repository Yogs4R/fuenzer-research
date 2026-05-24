import { create } from 'zustand';
import type {
  SearchScope,
  LoadingPhase,
  ResearchResponse,
} from '../types/research';
import { searchResearch } from '../services/api';

interface ResearchState {
  query: string;
  scope: SearchScope;
  loadingPhase: LoadingPhase;
  response: ResearchResponse | null;
  error: string | null;

  setQuery: (query: string) => void;
  setScope: (scope: SearchScope) => void;
  executeSearch: () => Promise<void>;
  reset: () => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  query: '',
  scope: 'global',
  loadingPhase: 'idle',
  response: null,
  error: null,

  setQuery: (query: string) => set({ query }),
  setScope: (scope: SearchScope) => set({ scope }),

  executeSearch: async () => {
    const { query, scope } = get();
    if (query.trim().length < 3) return;

    set({ loadingPhase: 'searching', error: null, response: null });

    // Simulate narrative phases for UX
    const phaseTimer = setTimeout(() => {
      set({ loadingPhase: 'filtering' });
    }, 1500);

    const synthTimer = setTimeout(() => {
      set({ loadingPhase: 'synthesizing' });
    }, 3500);

    try {
      const response = await searchResearch({ query: query.trim(), scope });
      clearTimeout(phaseTimer);
      clearTimeout(synthTimer);
      set({ response, loadingPhase: 'complete' });
    } catch (err: unknown) {
      clearTimeout(phaseTimer);
      clearTimeout(synthTimer);
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      set({ error: message, loadingPhase: 'error' });
    }
  },

  reset: () =>
    set({
      query: '',
      scope: 'global',
      loadingPhase: 'idle',
      response: null,
      error: null,
    }),
}));
