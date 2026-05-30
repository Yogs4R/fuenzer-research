import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useResearchStore } from './store/researchStore';
import { LandingPage } from './pages/LandingPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LibraryPage } from './pages/LibraryPage';
import { CitationsPage } from './pages/CitationsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

/** Global auth initializer — runs once on app mount */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initAuth, initialized, user } = useAuthStore();
  const { syncFromFirestore } = useResearchStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  // Sync context (localStorage + Firestore) when auth initializes or user ID changes
  useEffect(() => {
    if (initialized) {
      syncFromFirestore();
    }
  }, [initialized, user?.uid, syncFromFirestore]);

  // Show nothing while auth is initializing (prevents flash)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-fuenzer-teal/30 border-t-fuenzer-teal rounded-full animate-spin" />
          <p className="text-xs text-silver-mist font-sans">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/citations" element={<CitationsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
