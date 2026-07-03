import { create } from 'zustand';
import type {
  SearchScope,
  LoadingPhase,
  ResearchResponse,
  AcademicSource,
} from '../types/research';
import { searchResearch, askResearch } from '../services/api';
import { useAuthStore } from './authStore';
import {
  saveHistoryEntry,
  loadHistory,
  deleteHistoryEntry,
  clearAllHistory,
  type Library,
  createLibrary,
  updateLibraryPublicStatus,
  loadLibraries,
  saveBookmarkToLibrary,
  removeBookmarkFromLibrary,
  loadBookmarksFromLibrary,
  deleteLibrary,
  migrateLegacyBookmarks,
} from '../lib/firestore';

export function getCurrentHistoryKey(): string {
  const user = useAuthStore.getState().user;
  const userId = user?.uid || null;
  const isAnonymous = user?.isAnonymous ?? true;
  if (!userId) return 'fuenzer_search_history_guest';
  return isAnonymous ? 'fuenzer_search_history_guest' : `fuenzer_search_history_${userId}`;
}

function getCurrentLibrariesKey(): string {
  const user = useAuthStore.getState().user;
  const userId = user?.uid || null;
  const isAnonymous = user?.isAnonymous ?? true;
  if (!userId) return 'fuenzer_libraries_guest';
  return isAnonymous ? 'fuenzer_libraries_guest' : `fuenzer_libraries_${userId}`;
}

function getLibraryBookmarksKey(libraryId: string): string {
  const user = useAuthStore.getState().user;
  const userId = user?.uid || null;
  const isAnonymous = user?.isAnonymous ?? true;
  const prefix = isAnonymous ? 'guest' : (userId || 'guest');
  return `fuenzer_bookmarks_${prefix}_${libraryId}`;
}

function getLocalHistory(): HistoryEntry[] {
  const historyKey = getCurrentHistoryKey();
  try {
    const stored = localStorage.getItem(historyKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(history: HistoryEntry[]): void {
  const historyKey = getCurrentHistoryKey();
  try {
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save local history', e);
  }
}

function handleStateError(err: unknown, msgId: string, set: any) {
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
  set((state: any) => ({
    error: message,
    loadingPhase: 'error',
    messages: state.messages.map((m: any) =>
      m.id === `${msgId}-ai`
        ? { ...m, error: message, phase: 'error' }
        : m
    ),
  }));
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  type?: 'search' | 'ask';
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
  aiMode: 'search' | 'ask';

  bookmarkedSources: AcademicSource[];
  toggleBookmark: (source: AcademicSource) => void;

  // Multi-library state
  libraries: Library[];
  activeLibraryId: string;
  createFolder: (name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  togglePublicStatus: (id: string, isPublic: boolean) => Promise<void>;
  setActiveLibraryId: (id: string) => Promise<void>;
  toggleBookmarkInLibrary: (libraryId: string, source: AcademicSource) => Promise<void>;
  isBookmarkedInAnyLibrary: (sourceId: string) => boolean;
  getLibrariesForBookmark: (sourceId: string) => string[];

  setQuery: (query: string) => void;
  setScope: (scope: SearchScope) => void;
  setSearchType: (type: string) => void;
  setSearchLocation: (location: string) => void;
  setSearchAccreditation: (accreditation: string) => void;
  setSintaRank: (rank: string[]) => void;
  setAiMode: (mode: 'search' | 'ask') => void;
  executeSearch: () => Promise<void>;
  executeAsk: (question: string, selectedRefs: AcademicSource[]) => Promise<void>;
  clearMessages: () => void;
  reset: () => void;

  // History Actions
  initSession: (queryText: string) => string;
  forkSharedSession: (queryText: string, messages: ChatMessage[]) => string;
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

  const history = getLocalHistory();
  if (history.length === 0) return;

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
  saveLocalHistory(updated);
};

/** Sync current session to Firestore (background, non-blocking) */
const syncCurrentSessionToFirestore = (state: ResearchState) => {
  const userId = getCurrentUserId();
  if (!userId || !state.currentSessionId) return;

  const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
  if (isAnonymous) return;

  const history = getLocalHistory();
  const entry = history.find((h) => h.id === state.currentSessionId);
  if (entry) {
    // Fire and forget — don't await
    saveHistoryEntry(userId, entry).catch((err) =>
      console.warn('Firestore sync failed:', err)
    );
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
  aiMode: 'search',

  libraries: [],
  activeLibraryId: 'default',

  createFolder: async (name: string) => {
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    
    let newLib: Library;
    if (userId && !isAnonymous) {
      newLib = await createLibrary(userId, name, false);
    } else {
      newLib = {
        id: `lib-${Date.now()}`,
        name,
        isPublic: false,
      };
    }

    const updated = [...get().libraries, newLib];
    localStorage.setItem(getCurrentLibrariesKey(), JSON.stringify(updated));
    set({ libraries: updated });
  },

  removeFolder: async (id: string) => {
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    
    if (userId && !isAnonymous) {
      await deleteLibrary(userId, id);
    }

    const updated = get().libraries.filter(l => l.id !== id);
    localStorage.setItem(getCurrentLibrariesKey(), JSON.stringify(updated));

    // Clear bookmarks from localstorage
    localStorage.removeItem(getLibraryBookmarksKey(id));

    // Set fallback active library if deleted
    let activeId = get().activeLibraryId;
    let bookmarked = get().bookmarkedSources;
    if (activeId === id) {
      activeId = 'default';
      const stored = localStorage.getItem(getLibraryBookmarksKey('default'));
      bookmarked = stored ? JSON.parse(stored) : [];
    }

    set({ 
      libraries: updated,
      activeLibraryId: activeId,
      bookmarkedSources: bookmarked
    });
  },

  togglePublicStatus: async (id: string, isPublic: boolean) => {
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;

    if (userId && !isAnonymous) {
      await updateLibraryPublicStatus(userId, id, isPublic);
    }

    const updated = get().libraries.map(l => l.id === id ? { ...l, isPublic } : l);
    localStorage.setItem(getCurrentLibrariesKey(), JSON.stringify(updated));
    set({ libraries: updated });
  },

  setActiveLibraryId: async (id: string) => {
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    
    let bookmarked: AcademicSource[] = [];
    
    // Check localstorage cache
    const cacheKey = getLibraryBookmarksKey(id);
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      bookmarked = JSON.parse(stored);
    }

    set({ activeLibraryId: id, bookmarkedSources: bookmarked });

    // Fetch fresh from Firestore if logged in
    if (userId && !isAnonymous) {
      try {
        const fresh = await loadBookmarksFromLibrary(userId, id);
        localStorage.setItem(cacheKey, JSON.stringify(fresh));
        
        if (get().activeLibraryId === id) {
          set({ bookmarkedSources: fresh });
        }
      } catch (err) {
        console.warn('Failed to load bookmarks from library:', err);
      }
    }
  },

  toggleBookmarkInLibrary: async (libraryId: string, source: AcademicSource) => {
    const cacheKey = getLibraryBookmarksKey(libraryId);
    let cached: AcademicSource[] = [];
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      cached = JSON.parse(stored);
    }

    const exists = cached.some(s => s.id === source.id);
    let updated;
    if (exists) {
      updated = cached.filter(s => s.id !== source.id);
    } else {
      updated = [...cached, source];
    }

    localStorage.setItem(cacheKey, JSON.stringify(updated));

    // If it's the currently active library, sync state
    if (get().activeLibraryId === libraryId) {
      set({ bookmarkedSources: updated });
    }

    // Sync to Firestore
    const userId = getCurrentUserId();
    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      if (exists) {
        await removeBookmarkFromLibrary(userId, libraryId, source.id).catch(err => 
          console.warn('Failed to remove bookmark from Firestore:', err)
        );
      } else {
        await saveBookmarkToLibrary(userId, libraryId, source).catch(err =>
          console.warn('Failed to save bookmark to Firestore:', err)
        );
      }
    }
  },

  isBookmarkedInAnyLibrary: (sourceId: string) => {
    const libs = get().libraries;
    for (const lib of libs) {
      const cacheKey = getLibraryBookmarksKey(lib.id);
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const bookmarks = JSON.parse(stored) as AcademicSource[];
        if (bookmarks.some(s => s.id === sourceId)) return true;
      }
    }
    return false;
  },

  getLibrariesForBookmark: (sourceId: string) => {
    const libs = get().libraries;
    const matchedIds: string[] = [];
    for (const lib of libs) {
      const cacheKey = getLibraryBookmarksKey(lib.id);
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const bookmarks = JSON.parse(stored) as AcademicSource[];
        if (bookmarks.some(s => s.id === sourceId)) {
          matchedIds.push(lib.id);
        }
      }
    }
    return matchedIds;
  },

  toggleBookmark: (source: AcademicSource) => {
    get().toggleBookmarkInLibrary(get().activeLibraryId, source);
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
  setAiMode: (mode: 'search' | 'ask') => set({ aiMode: mode }),

  initSession: (queryText: string) => {
    const sessionId = `h-${Date.now()}`;
    const history = getLocalHistory();
    
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
    saveLocalHistory(updated);

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

  forkSharedSession: (queryText: string, messages: ChatMessage[]) => {
    const sessionId = `h-${Date.now()}`;
    const history = getLocalHistory();
    
    const newEntry: HistoryEntry = {
      id: sessionId,
      query: queryText,
      title: queryText,
      timestamp: Date.now(),
      messages: messages,
      response: null,
      scope: get().scope,
      searchType: get().searchType,
      searchLocation: get().searchLocation,
      searchAccreditation: get().searchAccreditation,
      sintaRank: get().sintaRank,
    };

    const updated = [newEntry, ...history].slice(0, 20);
    saveLocalHistory(updated);

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
      messages: messages,
      response: null,
      error: null,
      loadingPhase: 'complete',
    });

    return sessionId;
  },

  loadSession: (sessionId: string) => {
    const history = getLocalHistory();
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
  },

  updateSessionTitle: (title: string) => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;

    const history = getLocalHistory();
    const updated = history.map((h) =>
      h.id === currentSessionId ? { ...h, title: title } : h
    );
    saveLocalHistory(updated);

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
    const history = getLocalHistory();
    const updated = history.filter((h) => h.id !== sessionId);
    saveLocalHistory(updated);

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

  syncFromFirestore: async () => {
    const userId = getCurrentUserId();
    const librariesKey = getCurrentLibrariesKey();

    // 1. Local Cache Load First (Instantly responsive UI)
    let localLibraries: Library[] = [];
    try {
      const stored = localStorage.getItem(librariesKey);
      localLibraries = stored ? JSON.parse(stored) : [];
    } catch {}

    // Ensure default exists locally if empty
    if (localLibraries.length === 0) {
      localLibraries = [{ id: 'default', name: 'My Library', isPublic: false }];
    }

    const activeId = get().activeLibraryId || 'default';
    const cacheKey = getLibraryBookmarksKey(activeId);
    let localBookmarks: AcademicSource[] = [];
    try {
      const stored = localStorage.getItem(cacheKey);
      localBookmarks = stored ? JSON.parse(stored) : [];
    } catch {}

    set({
      libraries: localLibraries,
      activeLibraryId: activeId,
      bookmarkedSources: localBookmarks,
      messages: [],
      currentSessionId: null,
      response: null,
      error: null,
      loadingPhase: 'idle',
      query: '',
    });

    const isAnonymous = useAuthStore.getState().user?.isAnonymous ?? true;
    if (userId && !isAnonymous) {
      try {
        // A. Run background migration for legacy flat bookmarks
        await migrateLegacyBookmarks(userId);

        // B. Sync History
        const localHistory = getLocalHistory();
        const firestoreHistory = await loadHistory(userId);
        if (firestoreHistory.length > 0 || localHistory.length > 0) {
          const firestoreIds = new Set(firestoreHistory.map((h) => h.id));
          const uniqueLocal = localHistory.filter((h) => !firestoreIds.has(h.id));
          const merged = [...firestoreHistory, ...uniqueLocal]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 30);
          saveLocalHistory(merged);
          if (uniqueLocal.length > 0) {
            await Promise.all(
              uniqueLocal.map((entry) => saveHistoryEntry(userId, entry).catch(() => {}))
            );
          }
        }

        // C. Sync Libraries
        let firestoreLibs = await loadLibraries(userId);
        const hasDefault = firestoreLibs.some(l => l.id === 'default');
        if (!hasDefault) {
          const newDef = await createLibrary(userId, 'My Library', false, 'default');
          firestoreLibs = [newDef, ...firestoreLibs];
        }

        localStorage.setItem(librariesKey, JSON.stringify(firestoreLibs));
        set({ libraries: firestoreLibs });

        // D. Load bookmarks for all libraries and cache them locally
        for (const lib of firestoreLibs) {
          const freshBookmarks = await loadBookmarksFromLibrary(userId, lib.id);
          const libCacheKey = getLibraryBookmarksKey(lib.id);
          localStorage.setItem(libCacheKey, JSON.stringify(freshBookmarks));
          
          if (get().activeLibraryId === lib.id) {
            set({ bookmarkedSources: freshBookmarks });
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
          type: 'search',
          query: query.trim(),
          phase: 'searching' as LoadingPhase,
          timestamp: Date.now(),
        },
        {
          id: `${msgId}-ai`,
          role: 'ai' as const,
          type: 'search',
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
      handleStateError(err, msgId, set);
      syncSession(get());
    }
  },

  executeAsk: async (question: string, selectedRefs: AcademicSource[]) => {
    if (question.trim().length < 3) return;
    if (selectedRefs.length === 0) return;

    let sessionId = get().currentSessionId;
    if (!sessionId) {
      sessionId = get().initSession(question.trim());
    }

    const msgId = `msg-${Date.now()}`;

    // Add user message immediately
    set((state) => ({
      loadingPhase: 'synthesizing',
      error: null,
      messages: [
        ...state.messages,
        {
          id: msgId,
          role: 'user' as const,
          type: 'ask',
          query: question.trim(),
          phase: 'synthesizing' as LoadingPhase,
          timestamp: Date.now(),
        },
        {
          id: `${msgId}-ai`,
          role: 'ai' as const,
          type: 'ask',
          phase: 'synthesizing' as LoadingPhase,
          timestamp: Date.now() + 1,
        },
      ],
    }));
    syncSession(get());

    try {
      const response = await askResearch(question.trim(), selectedRefs);

      const res: ResearchResponse = {
        synthesis: response.answer,
        references: selectedRefs,
        latency_ms: response.latency_ms,
      };

      set((state) => ({
        loadingPhase: 'complete',
        messages: state.messages.map((m) =>
          m.id === `${msgId}-ai`
            ? { ...m, response: res, phase: 'complete' as LoadingPhase }
            : m
        ),
      }));
      syncSession(get());
    } catch (err: unknown) {
      handleStateError(err, msgId, set);
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
      aiMode: 'search',
    }),
}));
