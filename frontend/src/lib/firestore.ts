/**
 * firestore.ts — Firestore helpers for per-user history & bookmarks.
 * 
 * Data structure:
 *   users/{userId}/history/{sessionId}   → HistoryEntry
 *   users/{userId}/bookmarks/{sourceId}  → AcademicSource
 * 
 * All operations are user-scoped. Anonymous users also get their own documents.
 */
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AcademicSource } from '../types/research';
import type { HistoryEntry } from '../store/researchStore';

// ─── History ──────────────────────────────────────────────────────────────────

/** Save or update a history entry for the user */
export async function saveHistoryEntry(userId: string, entry: HistoryEntry): Promise<void> {
  const ref = doc(db, 'users', userId, 'history', entry.id);
  await setDoc(ref, {
    ...entry,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/** Load all history entries for a user (ordered by timestamp, max 30) */
export async function loadHistory(userId: string): Promise<HistoryEntry[]> {
  const colRef = collection(db, 'users', userId, 'history');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: data.id || d.id,
      query: data.query || '',
      title: data.title || data.query || '',
      timestamp: data.timestamp || 0,
      messages: data.messages || [],
      response: data.response || null,
      scope: data.scope || 'global',
      searchType: data.searchType || 'All',
      searchLocation: data.searchLocation || 'Global',
      searchAccreditation: data.searchAccreditation || 'Any',
      sintaRank: data.sintaRank || ['All'],
    } as HistoryEntry;
  });
}

/** Delete a single history entry */
export async function deleteHistoryEntry(userId: string, sessionId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'history', sessionId);
  await deleteDoc(ref);
}

/** Delete all history for a user */
export async function clearAllHistory(userId: string): Promise<void> {
  const colRef = collection(db, 'users', userId, 'history');
  const snapshot = await getDocs(colRef);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

/** Save a bookmark for the user */
export async function saveBookmark(userId: string, source: AcademicSource): Promise<void> {
  // Use a sanitized ID (OpenAlex IDs contain slashes, so encode them)
  const docId = encodeURIComponent(source.id);
  const ref = doc(db, 'users', userId, 'bookmarks', docId);
  await setDoc(ref, {
    ...source,
    savedAt: serverTimestamp(),
  });
}

/** Remove a bookmark */
export async function removeBookmark(userId: string, sourceId: string): Promise<void> {
  const docId = encodeURIComponent(sourceId);
  const ref = doc(db, 'users', userId, 'bookmarks', docId);
  await deleteDoc(ref);
}

/** Load all bookmarks for a user */
export async function loadBookmarks(userId: string): Promise<AcademicSource[]> {
  const colRef = collection(db, 'users', userId, 'bookmarks');
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: data.id || '',
      title: data.title || '',
      authors: data.authors || [],
      year: data.year || 0,
      publisher: data.publisher || '',
      abstract: data.abstract || undefined,
      indexes: data.indexes || [],
      url: data.url || '',
      content_type: data.content_type || '',
    } as AcademicSource;
  });
}

/** Delete all bookmarks for a user */
export async function clearAllBookmarks(userId: string): Promise<void> {
  const colRef = collection(db, 'users', userId, 'bookmarks');
  const snapshot = await getDocs(colRef);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
}

export interface Library {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt?: any;
}

// ─── Libraries ────────────────────────────────────────────────────────────────

/** Create a new library folder for a user */
export async function createLibrary(userId: string, name: string, isPublic: boolean = false, customId?: string): Promise<Library> {
  const libraryId = customId || `lib-${Date.now()}`;
  const ref = doc(db, 'users', userId, 'libraries', libraryId);
  const newLib: Library = {
    id: libraryId,
    name,
    isPublic,
  };
  await setDoc(ref, {
    ...newLib,
    createdAt: serverTimestamp(),
  });
  return newLib;
}

/** Update the public shareable status of a library */
export async function updateLibraryPublicStatus(userId: string, libraryId: string, isPublic: boolean): Promise<void> {
  const ref = doc(db, 'users', userId, 'libraries', libraryId);
  await setDoc(ref, { isPublic }, { merge: true });
}

/** Load all libraries for a user */
export async function loadLibraries(userId: string): Promise<Library[]> {
  const colRef = collection(db, 'users', userId, 'libraries');
  const snapshot = await getDocs(colRef);
  
  const libs = snapshot.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: d.id,
      name: data.name || 'Library',
      isPublic: data.isPublic ?? false,
    } as Library;
  });

  return libs;
}

/** Save a bookmark to a specific library */
export async function saveBookmarkToLibrary(userId: string, libraryId: string, source: AcademicSource): Promise<void> {
  const docId = encodeURIComponent(source.id);
  const ref = doc(db, 'users', userId, 'libraries', libraryId, 'bookmarks', docId);
  await setDoc(ref, {
    ...source,
    savedAt: serverTimestamp(),
  });
}

/** Remove a bookmark from a specific library */
export async function removeBookmarkFromLibrary(userId: string, libraryId: string, sourceId: string): Promise<void> {
  const docId = encodeURIComponent(sourceId);
  const ref = doc(db, 'users', userId, 'libraries', libraryId, 'bookmarks', docId);
  await deleteDoc(ref);
}

/** Load all bookmarks in a specific library */
export async function loadBookmarksFromLibrary(userId: string, libraryId: string): Promise<AcademicSource[]> {
  const colRef = collection(db, 'users', userId, 'libraries', libraryId, 'bookmarks');
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: data.id || '',
      title: data.title || '',
      authors: data.authors || [],
      year: data.year || 0,
      publisher: data.publisher || '',
      abstract: data.abstract || undefined,
      indexes: data.indexes || [],
      url: data.url || '',
      content_type: data.content_type || '',
    } as AcademicSource;
  });
}

/** Delete a library folder and all bookmarks inside it */
export async function deleteLibrary(userId: string, libraryId: string): Promise<void> {
  // First clear bookmarks inside it
  const colRef = collection(db, 'users', userId, 'libraries', libraryId, 'bookmarks');
  const snapshot = await getDocs(colRef);
  const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);

  // Then delete the library doc itself
  const libRef = doc(db, 'users', userId, 'libraries', libraryId);
  await deleteDoc(libRef);
}

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * Migrates bookmarks from legacy flat bookmarks collection into the new multi-library structure.
 * Creates a default library if bookmarks are found and copies them.
 */
export async function migrateLegacyBookmarks(userId: string): Promise<void> {
  const legacyColRef = collection(db, 'users', userId, 'bookmarks');
  const snapshot = await getDocs(legacyColRef);
  
  if (snapshot.empty) return; // Nothing to migrate

  console.log(`[Migration] Found ${snapshot.size} legacy bookmarks for user ${userId}. Migrating...`);

  // Ensure default library exists
  const defaultLibRef = doc(db, 'users', userId, 'libraries', 'default');
  const defaultLibSnap = await getDoc(defaultLibRef);
  if (!defaultLibSnap.exists()) {
    await createLibrary(userId, 'My Library', false, 'default');
  }

  // Copy each bookmark into the default library and delete the old doc
  for (const d of snapshot.docs) {
    const data = d.data() as AcademicSource;
    // Copy
    const newDocId = encodeURIComponent(data.id);
    const newRef = doc(db, 'users', userId, 'libraries', 'default', 'bookmarks', newDocId);
    await setDoc(newRef, {
      ...data,
      savedAt: serverTimestamp(),
    });
    // Delete legacy
    await deleteDoc(d.ref);
  }

  console.log(`[Migration] Migration completed for user ${userId}.`);
}

// ─── Public Access ────────────────────────────────────────────────────────────

/** Loads a public library and its bookmarks */
export async function loadPublicLibrary(userId: string, libraryId: string): Promise<{ library: Library; bookmarks: AcademicSource[] }> {
  const libRef = doc(db, 'users', userId, 'libraries', libraryId);
  const libSnap = await getDoc(libRef);

  if (!libSnap.exists()) {
    throw new Error('Pustaka tidak ditemukan.');
  }

  const libData = libSnap.data() as DocumentData;
  if (!libData.isPublic) {
    throw new Error('Pustaka ini bersifat privat.');
  }

  const library: Library = {
    id: libraryId,
    name: libData.name || 'Shared Library',
    isPublic: true,
  };

  const bookmarks = await loadBookmarksFromLibrary(userId, libraryId);
  return { library, bookmarks };
}

/** Loads a shared workspace session (read-only) */
export async function loadPublicSession(userId: string, sessionId: string): Promise<HistoryEntry> {
  const ref = doc(db, 'users', userId, 'history', sessionId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('Workspace tidak ditemukan.');
  }

  const data = snap.data() as DocumentData;
  return {
    id: data.id || snap.id,
    query: data.query || '',
    title: data.title || data.query || '',
    timestamp: data.timestamp || 0,
    messages: data.messages || [],
    response: data.response || null,
    scope: data.scope || 'global',
    searchType: data.searchType || 'All',
    searchLocation: data.searchLocation || 'Global',
    searchAccreditation: data.searchAccreditation || 'Any',
    sintaRank: data.sintaRank || ['All'],
  } as HistoryEntry;
}
