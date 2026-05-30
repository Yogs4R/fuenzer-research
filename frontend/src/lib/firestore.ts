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
      indexes: data.indexes || [],
      url: data.url || '',
      content_type: data.content_type || '',
    } as AcademicSource;
  });
}

/** Check if a source is bookmarked */
export async function isBookmarked(userId: string, sourceId: string): Promise<boolean> {
  const docId = encodeURIComponent(sourceId);
  const ref = doc(db, 'users', userId, 'bookmarks', docId);
  const snap = await getDoc(ref);
  return snap.exists();
}
