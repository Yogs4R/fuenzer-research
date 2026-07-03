import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useResearchStore, type ChatMessage } from '../store/researchStore';
import { useSEO } from '../hooks/useSEO';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { loadPublicSession } from '../lib/firestore';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Globe, Lock, GitFork, Check, Clock } from 'lucide-react';

export function SharedWorkspacePage() {
  const { hostUserId, sessionId } = useParams<{ hostUserId: string; sessionId: string }>();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const { language } = useUiStore();
  const isLanguageId = language === 'id';

  const { forkSharedSession } = useResearchStore();

  const [sessionData, setSessionData] = useState<{ query: string; messages: ChatMessage[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forking, setForking] = useState(false);
  const [forked, setForked] = useState(false);

  useSEO({
    canonical: window.location.href,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, navigate]);

  // Load public workspace session
  useEffect(() => {
    if (!hostUserId || !sessionId) return;
    setLoading(true);
    setError(null);

    loadPublicSession(hostUserId, sessionId)
      .then((session) => {
        setSessionData({
          query: session.query,
          messages: session.messages || [],
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat sesi workspace.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hostUserId, sessionId]);

  const handleFork = async () => {
    if (!sessionData) return;
    setForking(true);
    try {
      // Fork session into local store & Firestore
      forkSharedSession(sessionData.query, sessionData.messages);
      setForked(true);
      setTimeout(() => {
        // Redirect to playground and load this session
        navigate('/playground');
      }, 1500);
    } catch (err) {
      console.error('Failed to fork workspace:', err);
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans">
        <Navbar mode="playground" />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-fuenzer-teal border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans">
        <Navbar mode="playground" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink-black dark:text-paper-white font-serif">
            {isLanguageId ? 'Workspace Tidak Ditemukan' : 'Workspace Not Found'}
          </h2>
          <p className="text-xs text-slate-gray max-w-sm">
            {error || (isLanguageId ? 'Sesi ini privat atau telah dihapus.' : 'This session is private or has been deleted.')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-fuenzer-teal text-white rounded-xl text-xs font-bold hover:bg-fuenzer-teal-dark transition-colors cursor-pointer"
          >
            {isLanguageId ? 'Kembali ke Beranda' : 'Back to Home'}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Sharing Banner */}
      <div className="bg-fuenzer-teal text-white py-3.5 px-6 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4" />
            <p className="text-xs font-semibold">
              {isLanguageId 
                ? 'Anda melihat Sesi Riset yang dibagikan. Duplikat ke akun Anda untuk melanjutkan pencarian.' 
                : 'You are viewing a shared research session. Fork to your account to continue researching.'}
            </p>
          </div>
          <button
            onClick={handleFork}
            disabled={forking || forked}
            className="flex items-center gap-2 px-4 py-2 bg-white text-fuenzer-teal hover:bg-white/90 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-75"
          >
            {forked ? <Check className="w-4 h-4 text-emerald-600" /> : <GitFork className="w-4 h-4" />}
            {forked 
              ? (isLanguageId ? 'Tersalin! Mengalihkan...' : 'Copied! Redirecting...') 
              : (isLanguageId ? 'Duplikat Workspace (Fork)' : 'Fork Workspace')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 flex flex-col">
        {/* Title / Query Info */}
        <div className="mb-8 border-b border-cloud-canvas dark:border-stone-gray pb-6 select-none">
          <span className="text-[10px] font-bold text-fuenzer-teal uppercase tracking-widest block mb-1">
            {isLanguageId ? 'Topik Riset' : 'Research Topic'}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-black dark:text-paper-white font-serif leading-tight">
            "{sessionData.query}"
          </h1>
        </div>

        {/* Message Log */}
        <div className="flex-1 space-y-6">
          {sessionData.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            // If the AI message doesn't have a completed response yet
            if (!isUser && !msg.response) return null;

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl ${
                    isUser
                      ? 'bg-fuenzer-teal text-white rounded-tr-sm shadow-sm font-serif font-bold text-sm leading-snug'
                      : 'bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray rounded-tl-sm shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <span>{msg.query}</span>
                  ) : (
                    <div
                      className="prose prose-xs prose-slate dark:prose-invert max-w-none text-ink-black dark:text-slate-100 leading-relaxed text-xs [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>ul>li]:mb-1 [&>ol>li]:mb-1"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          marked.parse(msg.response?.synthesis || '', { async: false }) as string
                        ),
                      }}
                    />
                  )}
                </div>

                {/* Timestamp & Metadata */}
                {!isUser && msg.response && (
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-gray/70 dark:text-silver-mist/50 font-sans select-none px-1">
                    <Clock className="w-2.5 h-2.5 text-silver-mist" strokeWidth={2.5} />
                    <span>{msg.response.latency_ms ? (msg.response.latency_ms / 1000).toFixed(1) : '0.0'}s</span>
                    <span className="text-silver-mist">•</span>
                    <span>{msg.response.references?.length || 0} {isLanguageId ? 'referensi' : 'references'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
