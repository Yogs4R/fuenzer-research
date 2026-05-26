import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
import { JournalCard } from '../components/shared/JournalCard';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import {
  Search,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function LibraryPage() {
  const navigate = useNavigate();
  const { bookmarkedSources, toggleBookmark } = useResearchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useUiStore();
  const t = language === 'en' ? en.library : id.library;

  // Filter bookmarked sources locally based on search query
  const filtered = bookmarkedSources.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(query) ||
      s.authors.join(' ').toLowerCase().includes(query) ||
      (s.publisher && s.publisher.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Hero header */}
      <section className="bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray py-12 px-6 md:px-8 transition-colors shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fuenzer-teal">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">{t.badge}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink-black dark:text-paper-white leading-tight">
              {t.title}
            </h1>
            <p className="text-sm font-sans text-slate-gray dark:text-silver-mist max-w-xl">
              {t.desc}
            </p>
          </div>

          {/* Search bar */}
          {bookmarkedSources.length > 0 && (
            <div className="flex items-center border border-cloud-canvas dark:border-stone-gray rounded-xl px-4 h-12 hover:border-silver-mist focus-within:border-fuenzer-teal bg-cloud-canvas/30 dark:bg-stone-gray/30 transition-colors w-full md:w-80 font-sans">
              <Search className="w-4 h-4 text-silver-mist shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="flex-1 h-full text-sm outline-none bg-transparent dark:text-cloud-canvas placeholder:text-silver-mist"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-10 font-sans flex flex-col">
        {bookmarkedSources.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-fuenzer-teal/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-fuenzer-teal/20 to-transparent scale-0 group-hover:scale-100 transition-transform duration-500 rounded-3xl" />
              <BookmarkCheck className="w-10 h-10 text-fuenzer-teal relative z-10" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-ink-black dark:text-paper-white">
                {t.emptyTitle}
              </h2>
              <p className="text-xs text-slate-gray dark:text-silver-mist leading-relaxed font-sans">
                {t.emptyDesc}
              </p>
            </div>
            <button
              onClick={() => navigate('/playground')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer font-sans"
            >
              {t.searchButton}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Cards list */
          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center pb-2 border-b border-cloud-canvas dark:border-stone-gray">
              <span className="text-xs font-bold text-slate-gray dark:text-silver-mist uppercase tracking-wider font-sans">
                {filtered.length} {t.savedCount}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray shadow-sm">
                {t.noResults}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((source) => (
                  <JournalCard
                    key={source.id}
                    source={source}
                    isBookmarked={true}
                    onToggleBookmark={() => toggleBookmark(source)}
                    citationStyle="APA"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
