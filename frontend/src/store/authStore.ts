/**
 * authStore.ts — Zustand store for Firebase Authentication state.
 * 
 * Manages user session, loading state, and auth actions.
 * Auto-initializes anonymous session if no user is logged in.
 */
import { create } from 'zustand';
import {
  onAuthChange,
  signInAsGuest,
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithEmail,
  signUpWithEmail,
  logOut,
  type User,
} from '../lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providerId: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  initAuth: () => () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/** Convert Firebase User to our lean AuthUser type */
function mapUser(user: User): AuthUser {
  let photoURL = user.photoURL;
  let displayName = user.displayName;
  let email = user.email;

  if (!photoURL || !displayName || !email) {
    for (const profile of user.providerData) {
      if (!photoURL && profile.photoURL) photoURL = profile.photoURL;
      if (!displayName && profile.displayName) displayName = profile.displayName;
      if (!email && profile.email) email = profile.email;
    }
  }

  return {
    uid: user.uid,
    email: email,
    displayName: displayName,
    photoURL: photoURL,
    isAnonymous: user.isAnonymous,
    providerId: user.providerData[0]?.providerId || (user.isAnonymous ? 'anonymous' : 'unknown'),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  /**
   * Initialize auth listener. Call once on app mount.
   * Returns unsubscribe function for cleanup.
   * If no user is found, auto-signs in anonymously.
   */
  initAuth: () => {
    set({ loading: true });

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Auto-cleanup anonymous accounts older than 30 days
        if (firebaseUser.isAnonymous && firebaseUser.metadata.creationTime) {
          const createdMs = new Date(firebaseUser.metadata.creationTime).getTime();
          const ageDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
          if (ageDays > 30) {
            console.log(`[Auth] Anonymous user is ${ageDays.toFixed(1)} days old. Auto-cleaning up...`);
            try {
              const { deleteUser } = await import('firebase/auth');
              await deleteUser(firebaseUser);
              
              // Clear stale local guest data
              localStorage.removeItem('fuenzer_search_history_guest');
              localStorage.removeItem('fuenzer_bookmarked_library_guest');
              return; // exit early; onAuthChange will fire again with null, creating a new guest
            } catch (err) {
              console.warn('[Auth] Failed to auto-delete expired anonymous user:', err);
            }
          }
        }
        set({ user: mapUser(firebaseUser), loading: false, initialized: true });
      } else {
        // No user — auto sign in as anonymous guest
        try {
          await signInAsGuest();
          // onAuthChange will fire again with the anonymous user
        } catch {
          set({ user: null, loading: false, initialized: true });
        }
      }
    });

    return unsubscribe;
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithGoogle();
      set({ user: mapUser(user), loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      set({ error: message, loading: false });
    }
  },

  loginWithMicrosoft: async () => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithMicrosoft();
      set({ user: mapUser(user), loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Microsoft login failed';
      set({ error: message, loading: false });
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const user = await signInWithEmail(email, password);
      set({ user: mapUser(user), loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, loading: false });
    }
  },

  registerWithEmail: async (email: string, password: string, displayName: string) => {
    set({ loading: true, error: null });
    try {
      const user = await signUpWithEmail(email, password, displayName);
      set({ user: mapUser(user), loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, loading: false });
    }
  },

  loginAsGuest: async () => {
    set({ loading: true, error: null });
    try {
      const user = await signInAsGuest();
      set({ user: mapUser(user), loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Guest login failed';
      set({ error: message, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logOut();
      // After logout, onAuthChange will trigger and auto-sign in as anonymous
      set({ loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      set({ error: message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
