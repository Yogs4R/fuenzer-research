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
  loadDemoData: () => void;
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
  setSearchLocation: (location: string) => set({ searchLocation: location }),
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

      const response = await searchResearch({ query: query.trim(), scope, ...(typeFilter ? { type: typeFilter as 'article' | 'book' | 'journal' } : {}) });
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

  loadDemoData: () => {
    const demoResponse: ResearchResponse = {
      synthesis:
        'Penelitian dalam bidang **machine learning** menunjukkan perkembangan signifikan dalam dekade terakhir. ' +
        'Berbagai pendekatan seperti deep learning (LeCun et al., 2023), transfer learning (Devlin et al., 2022), ' +
        'dan federated learning (McMahan et al., 2021) telah diaplikasikan pada berbagai domain ilmu pengetahuan. ' +
        'Secara khusus, model transformer berbasis attention mechanism berhasil melampaui performa model-model sebelumnya ' +
        'dalam tugas Natural Language Processing dan Computer Vision. ' +
        'Implikasi praktis dari temuan ini mencakup otomasi diagnosa medis, sistem rekomendasi adaptif, ' +
        'dan pengenalan pola dalam data ilmiah skala besar.',
      references: [
        {
          id: 'demo-1',
          title: 'Deep Learning in Medical Image Analysis: A Comprehensive Survey',
          authors: ['Yann LeCun', 'Yoshua Bengio', 'Geoffrey Hinton'],
          year: 2023,
          publisher: 'IEEE Transactions on Medical Imaging',
          indexes: [{ provider: 'SINTA', tier: '1' }, { provider: 'Scopus', tier: 'Q1' }],
          url: 'https://example.com/1',
        },
        {
          id: 'demo-2',
          title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
          authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee'],
          year: 2022,
          publisher: 'Proceedings of NAACL-HLT 2022',
          indexes: [{ provider: 'SINTA', tier: '2' }, { provider: 'Scopus', tier: 'Q2' }],
          url: 'https://example.com/2',
        },
        {
          id: 'demo-3',
          title: 'Federated Learning of Deep Networks using Model Averaging',
          authors: ['Brendan McMahan', 'Eider Moore', 'Daniel Ramage'],
          year: 2021,
          publisher: 'Journal of Machine Learning Research',
          indexes: [{ provider: 'SINTA', tier: '3' }, { provider: 'Garuda', tier: 'A' }],
          url: 'https://example.com/3',
        },
        {
          id: 'demo-4',
          title: 'Penerapan Machine Learning pada Sistem Deteksi Fraud Perbankan Indonesia',
          authors: ['Budi Santoso', 'Dewi Rahayu', 'Ahmad Fauzi'],
          year: 2023,
          publisher: 'Jurnal Teknologi Informasi dan Ilmu Komputer (JTIIK)',
          indexes: [{ provider: 'SINTA', tier: '2' }, { provider: 'Garuda', tier: 'B' }],
          url: 'https://example.com/4',
        },
        {
          id: 'demo-5',
          title: 'Analisis Sentimen Media Sosial Menggunakan Algoritma Deep Learning',
          authors: ['Siti Nurhaliza', 'Rizky Pratama'],
          year: 2022,
          publisher: 'SINTA Journal of Computer Science',
          indexes: [{ provider: 'SINTA', tier: '4' }],
          url: 'https://example.com/5',
        },
        {
          id: 'demo-6',
          title: 'Vision Transformers for Image Recognition at Scale',
          authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov'],
          year: 2021,
          publisher: 'International Conference on Learning Representations',
          indexes: [{ provider: 'Scopus', tier: 'Q1' }],
          url: 'https://example.com/6',
        },
        {
          id: 'demo-7',
          title: 'Pengaruh Kecerdasan Buatan terhadap Produktivitas Tenaga Kerja di Era Industri 4.0',
          authors: ['Hendra Wijaya', 'Rina Kusumawati', 'Joko Susilo'],
          year: 2022,
          publisher: 'Jurnal Ekonomi dan Bisnis',
          indexes: [{ provider: 'SINTA', tier: '3' }, { provider: 'Garuda', tier: 'A' }],
          url: 'https://example.com/7',
        },
      ],
      latency_ms: 1842,
    };
    const msgId = 'demo-session';
    set({
      query: 'Machine Learning',
      loadingPhase: 'complete',
      response: demoResponse,
      messages: [
        { id: msgId, role: 'user', query: 'Machine Learning', phase: 'complete', timestamp: Date.now() - 8000 },
        { id: `${msgId}-ai`, role: 'ai', response: demoResponse, phase: 'complete', timestamp: Date.now() - 5000 },
      ],
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
