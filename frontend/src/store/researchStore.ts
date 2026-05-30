import { create } from 'zustand';
import type {
  SearchScope,
  LoadingPhase,
  ResearchResponse,
  AcademicSource,
} from '../types/research';
import { searchResearch } from '../services/api';
import { useAuthStore } from './authStore';
import {
  saveHistoryEntry,
  loadHistory,
  saveBookmark,
  removeBookmark,
  loadBookmarks,
  deleteHistoryEntry,
  clearAllHistory,
} from '../lib/firestore';

export function getCurrentHistoryKey(): string {
  const user = useAuthStore.getState().user;
  const userId = user?.uid || null;
  const isAnonymous = user?.isAnonymous ?? true;
  if (!userId) return 'fuenzer_search_history_guest';
  return isAnonymous ? 'fuenzer_search_history_guest' : `fuenzer_search_history_${userId}`;
}

export function getCurrentBookmarksKey(): string {
  const user = useAuthStore.getState().user;
  const userId = user?.uid || null;
  const isAnonymous = user?.isAnonymous ?? true;
  if (!userId) return 'fuenzer_bookmarked_library_guest';
  return isAnonymous ? 'fuenzer_bookmarked_library_guest' : `fuenzer_bookmarked_library_${userId}`;
}

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
  deleteSession: (sessionId: string) => void;
  clearHistory: () => void;

  // Firestore sync
  syncFromFirestore: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get current authenticated user ID (or null) */
function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.uid || null;
}

/** Sync current session to localStorage (fast local cache) */
const syncCurrentSessionToLocalStorage = (state: ResearchState) => {
  const { currentSessionId } = state;
  if (!currentSessionId) return;

  const historyKey = getCurrentHistoryKey();
  const stored = localStorage.getItem(historyKey);
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
    localStorage.setItem(historyKey, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to sync session to localStorage', e);
  }
};

/** Sync current session to Firestore (background, non-blocking) */
const syncCurrentSessionToFirestore = (state: ResearchState) => {
  const userId = getCurrentUserId();
  if (!userId || !state.currentSessionId) return;

  const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
  if (isAnonymous) return;

  const historyKey = getCurrentHistoryKey();
  const stored = localStorage.getItem(historyKey);
  if (!stored) return;

  try {
    const history: HistoryEntry[] = JSON.parse(stored);
    const entry = history.find((h) => h.id === state.currentSessionId);
    if (entry) {
      // Fire and forget — don't await
      saveHistoryEntry(userId, entry).catch((err) =>
        console.warn('Firestore sync failed:', err)
      );
    }
  } catch {
    // Silent fail
  }
};

/** Combined sync: localStorage + Firestore */
const syncSession = (state: ResearchState) => {
  syncCurrentSessionToLocalStorage(state);
  syncCurrentSessionToFirestore(state);
};

// ─── Store ────────────────────────────────────────────────────────────────────

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
  bookmarkedSources: [],
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
    // Local cache
    const bookmarksKey = getCurrentBookmarksKey();
    localStorage.setItem(bookmarksKey, JSON.stringify(updated));
    set({ bookmarkedSources: updated });

    // Firestore sync (background)
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      if (exists) {
        removeBookmark(userId, source.id).catch((err) =>
          console.warn('Failed to remove bookmark from Firestore:', err)
        );
      } else {
        saveBookmark(userId, source).catch((err) =>
          console.warn('Failed to save bookmark to Firestore:', err)
        );
      }
    }
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
    const historyKey = getCurrentHistoryKey();
    
    let history: HistoryEntry[] = [];
    try {
      const stored = localStorage.getItem(historyKey);
      history = stored ? JSON.parse(stored) : [];
    } catch {}
    
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

    const updated = [newEntry, ...history].slice(0, 20);
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Firestore sync (background)
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      saveHistoryEntry(userId, newEntry).catch((err) =>
        console.warn('Failed to save history to Firestore:', err)
      );
    }

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
    const historyKey = getCurrentHistoryKey();
    const stored = localStorage.getItem(historyKey);
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

    const historyKey = getCurrentHistoryKey();
    const stored = localStorage.getItem(historyKey);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = history.map((h) =>
      h.id === currentSessionId ? { ...h, title: title } : h
    );
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Firestore sync
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      const entry = updated.find((h) => h.id === currentSessionId);
      if (entry) {
        saveHistoryEntry(userId, entry).catch(() => {});
      }
    }
  },

  deleteSession: (sessionId: string) => {
    const historyKey = getCurrentHistoryKey();
    // Remove from localStorage
    const stored = localStorage.getItem(historyKey);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = history.filter((h) => h.id !== sessionId);
    localStorage.setItem(historyKey, JSON.stringify(updated));

    // Remove from Firestore
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      deleteHistoryEntry(userId, sessionId).catch((err) =>
        console.warn('Failed to delete history from Firestore:', err)
      );
    }
  },

  clearHistory: () => {
    const historyKey = getCurrentHistoryKey();
    // Clear localStorage
    localStorage.removeItem(historyKey);

    // Clear Firestore
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      clearAllHistory(userId).catch((err) =>
        console.warn('Failed to clear history from Firestore:', err)
      );
    }
  },

  /**
   * Sync data from Firestore into local state.
   * Called once after auth is initialized / user changes.
   * Merges Firestore data with any existing localStorage data.
   */
  syncFromFirestore: async () => {
    const userId = getCurrentUserId();
    const historyKey = getCurrentHistoryKey();
    const bookmarksKey = getCurrentBookmarksKey();

    // 1. Load history from local storage specific to this user/guest
    let localHistory: HistoryEntry[] = [];
    try {
      const stored = localStorage.getItem(historyKey);
      localHistory = stored ? JSON.parse(stored) : [];
    } catch {}

    // 2. Load bookmarks from local storage specific to this user/guest
    let localBookmarks: AcademicSource[] = [];
    try {
      const stored = localStorage.getItem(bookmarksKey);
      localBookmarks = stored ? JSON.parse(stored) : [];
    } catch {}

    // 3. Update the state with these local values first
    // Also, when context is loaded/reloaded, clear any active session states to prevent leaks!
    set({
      bookmarkedSources: localBookmarks,
      messages: [],
      currentSessionId: null,
      response: null,
      error: null,
      loadingPhase: 'idle',
      query: '',
    });

    // 4. If we have a real user (not anonymous), sync with Firestore in the background
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      try {
        // Load history from Firestore
        const firestoreHistory = await loadHistory(userId);
        if (firestoreHistory.length > 0 || localHistory.length > 0) {
          // Merge: Firestore wins for same IDs, keep unique locals
          const firestoreIds = new Set(firestoreHistory.map((h) => h.id));
          const uniqueLocal = localHistory.filter((h) => !firestoreIds.has(h.id));
          const merged = [...firestoreHistory, ...uniqueLocal]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 30);
          
          localStorage.setItem(historyKey, JSON.stringify(merged));

          // Upload local-only entries to Firestore so they sync to other devices
          if (uniqueLocal.length > 0) {
            await Promise.all(
              uniqueLocal.map((entry) =>
                saveHistoryEntry(userId, entry).catch((err) =>
                  console.warn('Failed to upload local history:', err)
                )
              )
            );
          }
        }

        // Load bookmarks from Firestore
        const firestoreBookmarks = await loadBookmarks(userId);
        if (firestoreBookmarks.length > 0 || localBookmarks.length > 0) {
          // Merge: Firestore + unique locals
          const firestoreIds = new Set(firestoreBookmarks.map((b) => b.id));
          const uniqueLocal = localBookmarks.filter((b) => !firestoreIds.has(b.id));
          const merged = [...firestoreBookmarks, ...uniqueLocal];

          localStorage.setItem(bookmarksKey, JSON.stringify(merged));
          set({ bookmarkedSources: merged });

          // Upload local-only bookmarks to Firestore so they sync to other devices
          if (uniqueLocal.length > 0) {
            await Promise.all(
              uniqueLocal.map((source) =>
                saveBookmark(userId, source).catch((err) =>
                  console.warn('Failed to upload local bookmark:', err)
                )
              )
            );
          }
        }
      } catch (err) {
        console.warn('Failed to sync from Firestore:', err);
      }
    }
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
    syncSession(get());

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
      syncSession(get());
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
      syncSession(get());
    }
  },

  clearMessages: () => {
    set({
      messages: [],
      loadingPhase: 'idle',
      response: null,
      error: null,
    });
    syncSession(get());
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
