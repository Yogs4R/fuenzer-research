import { create } from 'zustand';
import type {
  SearchScope,
  LoadingPhase,
  ResearchResponse,
  AcademicSource,
} from '../types/research';
import { searchResearch } from '../services/api';

export const HISTORY_KEY = 'fuenzer_search_history';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  query?: string;
  response?: ResearchResponse;
  error?: string;
  phase: LoadingPhase;
  timestamp: number;
}

export interface HistoryEntry {
  id: string;
  query: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
  response: ResearchResponse | null;
  scope: SearchScope;
  searchType: string;
  searchLocation: string;
  searchAccreditation: string;
  sintaRank: string[];
}

interface ResearchState {
  query: string;
  scope: SearchScope;
  searchType: string;
  searchLocation: string;
  searchAccreditation: string;
  sintaRank: string[];
  loadingPhase: LoadingPhase;
  response: ResearchResponse | null;
  error: string | null;
  messages: ChatMessage[];
  currentSessionId: string | null;

  bookmarkedSources: AcademicSource[];
  toggleBookmark: (source: AcademicSource) => void;

  setQuery: (query: string) => void;
  setScope: (scope: SearchScope) => void;
  setSearchType: (type: string) => void;
  setSearchLocation: (location: string) => void;
  setSearchAccreditation: (accreditation: string) => void;
  setSintaRank: (rank: string[]) => void;
  executeSearch: () => Promise<void>;
  clearMessages: () => void;
  reset: () => void;

  // History Actions
  initSession: (queryText: string) => string;
  loadSession: (sessionId: string) => void;
  updateSessionTitle: (title: string) => void;
}

const syncCurrentSessionToLocalStorage = (state: ResearchState) => {
  const { currentSessionId } = state;
  if (!currentSessionId) return;

  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return;

  try {
    const history: HistoryEntry[] = JSON.parse(stored);
    const updated = history.map((entry) => {
      if (entry.id === currentSessionId) {
        return {
          ...entry,
          query: state.query,
          messages: state.messages,
          response: state.response,
          scope: state.scope,
          searchType: state.searchType,
          searchLocation: state.searchLocation,
          searchAccreditation: state.searchAccreditation,
          sintaRank: state.sintaRank,
        };
      }
      return entry;
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to sync session to localStorage', e);
  }
};

export const useResearchStore = create<ResearchState>((set, get) => ({
  query: '',
  scope: 'global',
  searchType: 'All',
  searchLocation: 'Global',
  searchAccreditation: 'Any',
  sintaRank: ['All'],
  loadingPhase: 'idle',
  response: null,
  error: null,
  bookmarkedSources: (() => {
    try {
      const stored = localStorage.getItem('fuenzer_bookmarked_library');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  messages: [],
  currentSessionId: null,

  toggleBookmark: (source: AcademicSource) => {
    const current = get().bookmarkedSources;
    const exists = current.some((s) => s.id === source.id);
    let updated;
    if (exists) {
      updated = current.filter((s) => s.id !== source.id);
    } else {
      updated = [...current, source];
    }
    localStorage.setItem('fuenzer_bookmarked_library', JSON.stringify(updated));
    set({ bookmarkedSources: updated });
  },

  setQuery: (query: string) => set({ query }),
  setScope: (scope: SearchScope) => set({ scope }),
  setSearchType: (type: string) => set({ searchType: type }),
  setSearchLocation: (location: string) => set({ 
    searchLocation: location,
    scope: location.toLowerCase() === 'indonesia' ? 'indonesia' : 'global'
  }),
  setSearchAccreditation: (accreditation: string) => set({ searchAccreditation: accreditation }),
  setSintaRank: (rank: string[]) => set({ sintaRank: rank }),

  initSession: (queryText: string) => {
    const sessionId = `h-${Date.now()}`;
    const stored = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    
    const newEntry: HistoryEntry = {
      id: sessionId,
      query: queryText,
      title: queryText,
      timestamp: Date.now(),
      messages: [],
      response: null,
      scope: get().scope,
      searchType: get().searchType,
      searchLocation: get().searchLocation,
      searchAccreditation: get().searchAccreditation,
      sintaRank: get().sintaRank,
    };

    const updated = [newEntry, ...history.filter((h) => h.query !== queryText)].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    set({
      currentSessionId: sessionId,
      query: queryText,
      messages: [],
      response: null,
      error: null,
      loadingPhase: 'idle',
    });

    return sessionId;
  },

  loadSession: (sessionId: string) => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return;

    try {
      const history: HistoryEntry[] = JSON.parse(stored);
      const entry = history.find((h) => h.id === sessionId);
      if (!entry) return;

      set({
        currentSessionId: entry.id,
        query: entry.query,
        messages: entry.messages || [],
        response: entry.response || null,
        scope: entry.scope || 'global',
        searchType: entry.searchType || 'All',
        searchLocation: entry.searchLocation || 'Global',
        searchAccreditation: entry.searchAccreditation || 'Any',
        sintaRank: entry.sintaRank || ['All'],
        loadingPhase: (entry.messages && entry.messages.length > 0) ? 'complete' : 'idle',
        error: null,
      });
    } catch (e) {
      console.error('Failed to load session', e);
    }
  },

  updateSessionTitle: (title: string) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    const stored = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = history.map((h) =>
      h.id === currentSessionId ? { ...h, title: title } : h
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  },

  executeSearch: async () => {
    const { query, scope } = get();
    if (query.trim().length < 3) return;

    let sessionId = get().currentSessionId;
    if (!sessionId) {
      sessionId = get().initSession(query.trim());
    }

    const msgId = `msg-${Date.now()}`;

    // Add user message immediately
    set((state) => ({
      loadingPhase: 'searching',
      error: null,
      response: null,
      messages: [
        ...state.messages,
        {
          id: msgId,
          role: 'user' as const,
          query: query.trim(),
          phase: 'searching' as LoadingPhase,
          timestamp: Date.now(),
        },
        {
          id: `${msgId}-ai`,
          role: 'ai' as const,
          phase: 'searching' as LoadingPhase,
          timestamp: Date.now() + 1,
        },
      ],
    }));
    syncCurrentSessionToLocalStorage(get());

    // Simulate narrative phases for UX
    const phaseTimer = setTimeout(() => {
      set((state) => ({
        loadingPhase: 'filtering',
        messages: state.messages.map((m) =>
          m.id === `${msgId}-ai` ? { ...m, phase: 'filtering' as LoadingPhase } : m
        ),
      }));
      syncCurrentSessionToLocalStorage(get());
    }, 1500);

    const synthTimer = setTimeout(() => {
      set((state) => ({
        loadingPhase: 'synthesizing',
        messages: state.messages.map((m) =>
          m.id === `${msgId}-ai` ? { ...m, phase: 'synthesizing' as LoadingPhase } : m
        ),
      }));
      syncCurrentSessionToLocalStorage(get());
    }, 3500);

    try {
      // Map dropdown searchType to API type parameter
      const typeMap: Record<string, string> = {
        'All': '',
        'Articles': 'article',
        'Journals': 'journal',
        'Books': 'book',
      };
      const searchTypeValue = get().searchType;
      const typeFilter = typeMap[searchTypeValue] || '';

      const response = await searchResearch({ 
        query: query.trim(), 
        scope, 
        ...(typeFilter ? { type: typeFilter as 'article' | 'book' | 'journal' } : {}),
        index: get().searchAccreditation,
        sinta_rank: get().sintaRank,
      });
      clearTimeout(phaseTimer);
      clearTimeout(synthTimer);
      set((state) => ({
        response,
        loadingPhase: 'complete',
        messages: state.messages.map((m) =>
          m.id === `${msgId}-ai`
            ? { ...m, response, phase: 'complete' as LoadingPhase }
            : m
        ),
      }));
      syncCurrentSessionToLocalStorage(get());
    } catch (err: unknown) {
      clearTimeout(phaseTimer);
      clearTimeout(synthTimer);
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      set((state) => ({
        error: message,
        loadingPhase: 'error',
        messages: state.messages.map((m) =>
          m.id === `${msgId}-ai`
            ? { ...m, error: message, phase: 'error' as LoadingPhase }
            : m
        ),
      }));
      syncCurrentSessionToLocalStorage(get());
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      loadingPhase: 'idle',
      response: null,
      error: null,
    });
    syncCurrentSessionToLocalStorage(get());
  },


  reset: () =>
    set({
      query: '',
      scope: 'global',
      searchType: 'All',
      searchLocation: 'Global',
      searchAccreditation: 'Any',
      sintaRank: ['All'],
      loadingPhase: 'idle',
      response: null,
      error: null,
      messages: [],
      currentSessionId: null,
    }),
}));
