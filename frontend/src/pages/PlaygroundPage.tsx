import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useResearchStore } from '../store/researchStore';
import { NarrativeSkeletonLoader } from '../components/shared/NarrativeSkeletonLoader';
import { JournalCard } from '../components/shared/JournalCard';
import {
  Search,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import type { SearchScope } from '../types/research';

export function PlaygroundPage() {
  const navigate = useNavigate();
  const {
    query,
    scope,
    loadingPhase,
    response,
    error,
    setQuery,
    setScope,
    executeSearch,
  } = useResearchStore();

  useEffect(() => {
    // If no query, redirect to landing
    if (!query.trim() && loadingPhase === 'idle' && !response) {
      navigate('/');
    }
  }, [query, loadingPhase, response, navigate]);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    await executeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isLoading =
    loadingPhase === 'searching' ||
    loadingPhase === 'filtering' ||
    loadingPhase === 'synthesizing';

  return (
    <div className="h-screen flex flex-col bg-alabaster">
      {/* Top bar - h-16 per design spec */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden md:inline">Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-600" strokeWidth={1.5} />
          <span className="font-serif font-bold text-[#0F172A]">Fuenzer</span>
        </div>

        {/* Search bar in header */}
        <div className="flex-1 max-w-xl mx-auto flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-alabaster rounded-lg border border-slate-200 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50 transition-all">
            <Search className="w-4 h-4 text-[#64748B] ml-3" strokeWidth={1.5} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari topik riset..."
              className="flex-1 h-10 px-3 bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
              maxLength={200}
            />
          </div>

          {/* Scope toggle */}
          <div className="hidden md:flex rounded-md border border-slate-200 overflow-hidden">
            {(['global', 'indonesia'] as SearchScope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  scope === s
                    ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white'
                    : 'bg-white text-[#64748B] hover:bg-slate-50'
                }`}
              >
                {s === 'global' ? '🌍' : '🇮🇩'}
              </button>
            ))}
          </div>

          <button
            onClick={handleSearch}
            disabled={query.trim().length < 3 || isLoading}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main content: split-screen */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: AI Assistant (40%) */}
        <section className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto bg-white">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" strokeWidth={1.5} />
              <h2 className="font-serif font-semibold text-[#0F172A] text-lg">
                Sintesis AI
              </h2>
            </div>

            {/* Loading state */}
            {isLoading && <NarrativeSkeletonLoader phase={loadingPhase} />}

            {/* Error state */}
            {loadingPhase === 'error' && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {error || 'Terjadi kesalahan. Silakan coba lagi.'}
              </div>
            )}

            {/* Synthesis result */}
            {loadingPhase === 'complete' && response && (
              <div className="space-y-4">
                <div
                  className="prose prose-sm prose-slate max-w-none text-[#334155] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      response.synthesis.replace(/\n/g, '<br />')
                    ),
                  }}
                />

                {/* Latency info */}
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] pt-2 border-t border-slate-100">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Diproses dalam {(response.latency_ms / 1000).toFixed(1)} detik
                </div>
              </div>
            )}

            {/* Idle state */}
            {loadingPhase === 'idle' && !response && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#94A3B8]">
                <Sparkles className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">Masukkan query riset untuk memulai sintesis AI</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Knowledge Base (60%) */}
        <section className="w-full md:w-3/5 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" strokeWidth={1.5} />
                <h2 className="font-serif font-semibold text-[#0F172A] text-lg">
                  Referensi
                </h2>
              </div>
              {response && (
                <span className="text-xs text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full">
                  {response.references.length} paper
                </span>
              )}
            </div>

            {/* Reference cards */}
            {loadingPhase === 'complete' && response && (
              <div className="space-y-3">
                {response.references.length === 0 ? (
                  <div className="text-center py-12 text-[#94A3B8] text-sm">
                    Tidak ditemukan referensi untuk query ini.
                  </div>
                ) : (
                  response.references.map((source) => (
                    <JournalCard key={source.id} source={source} />
                  ))
                )}
              </div>
            )}

            {/* Loading skeleton cards */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse"
                  >
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 bg-slate-100 rounded-full w-16" />
                      <div className="h-5 bg-slate-100 rounded-full w-12" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Idle */}
            {loadingPhase === 'idle' && !response && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#94A3B8]">
                <BookOpen className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
                <p className="text-sm">Referensi jurnal akan muncul di sini</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
