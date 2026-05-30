/**
 * Firebase initialization and configuration.
 * 
 * This file initializes the Firebase app with environment variables
 * and exports the auth and firestore instances for use across the app.
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Firestore instance
export const db = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');

// ─── Auth Helper Functions ────────────────────────────────────────────────────

/** Sign in anonymously (silent, no UI prompt) */
export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

/** 
 * Sign in with Google popup.
 * If current user is anonymous, links the anonymous account to Google (preserves UID).
 */
export async function signInWithGoogle(): Promise<User> {
  const currentUser = auth.currentUser;
  if (currentUser?.isAnonymous) {
    // Link anonymous account to Google — preserves UID and Firestore data
    const result = await linkWithPopup(currentUser, googleProvider);
    return result.user;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** 
 * Sign in with Microsoft popup.
 * If current user is anonymous, links the anonymous account to Microsoft (preserves UID).
 */
export async function signInWithMicrosoft(): Promise<User> {
  const currentUser = auth.currentUser;
  if (currentUser?.isAnonymous) {
    // Link anonymous account to Microsoft — preserves UID and Firestore data
    const result = await linkWithPopup(currentUser, microsoftProvider);
    return result.user;
  }
  const result = await signInWithPopup(auth, microsoftProvider);
  return result.user;
}

/** Sign in with email and password (existing account) */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/** 
 * Create account with email and password.
 * If current user is anonymous, links the credential to preserve UID and Firestore data.
 * Otherwise creates a new account.
 */
export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const currentUser = auth.currentUser;
  if (currentUser?.isAnonymous) {
    // Link anonymous account to email — preserves UID and Firestore data
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(currentUser, credential);
    await updateProfile(result.user, { displayName });
    return result.user;
  }
  // No anonymous user — create fresh account
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

/** Sign out the current user */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
