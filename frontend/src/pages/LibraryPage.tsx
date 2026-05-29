import { useState, useEffect, useRef } from 'react';
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
  SlidersHorizontal,
  CheckSquare,
  Square,
  Filter,
  ChevronDown,
} from 'lucide-react';

type SortOption = 'relevance' | 'newest' | 'oldest' | 'title';
type FilterIndex = 'All' | 'SINTA 1' | 'SINTA 2' | 'SINTA 3' | 'SINTA 4' | 'SINTA 5' | 'SINTA 6' | 'Scopus' | 'Garuda';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
];

const INDEX_FILTERS: FilterIndex[] = ['All', 'SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'SINTA 5', 'SINTA 6', 'Scopus', 'Garuda'];

function sortSources(sources: any[], sort: SortOption): any[] {
  const copy = [...sources];
  if (sort === 'newest') return copy.sort((a, b) => b.year - a.year);
  if (sort === 'oldest') return copy.sort((a, b) => a.year - b.year);
  if (sort === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

function filterByIndexes(sources: any[], filters: Set<FilterIndex>): any[] {
  if (filters.has('All') || filters.size === 0) return sources;
  return sources.filter((s) =>
    [...filters].some((f) => {
      if (f === 'Scopus') return s.indexes?.some((i: any) => i.provider.toLowerCase() === 'scopus');
      if (f === 'Garuda') return s.indexes?.some((i: any) => i.provider.toLowerCase() === 'garuda');
      const tier = f.split(' ')[1]; // 'SINTA 1' → '1'
      return s.indexes?.some((i: any) => i.provider.toLowerCase() === 'sinta' && i.tier === tier);
    })
  );
}

// Reusable Dropdown Component
function Dropdown({
  trigger,
  children,
  align = 'right',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'right' | 'left';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative font-sans" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute top-full mt-1 z-30 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150 ${align === 'right' ? 'right-0' : 'left-0'}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
        active
          ? 'font-bold text-fuenzer-teal bg-fuenzer-teal/10'
          : 'text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30'
      }`}
    >
      {label}
    </button>
  );
}

export function LibraryPage() {
  const navigate = useNavigate();
  const { bookmarkedSources, toggleBookmark } = useResearchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'All' | 'Articles' | 'Journals' | 'Books'>('All');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [indexFilters, setIndexFilters] = useState<Set<FilterIndex>>(new Set(['All']));
  const [showFilters, setShowFilters] = useState(false);
  const { language } = useUiStore();
  const t = language === 'en' ? en.library : id.library;

  // Toggle single index filter selection
  const toggleIndexFilter = (f: FilterIndex) => {
    setIndexFilters((prev) => {
      const next = new Set(prev);
      if (f === 'All') {
        return new Set<FilterIndex>(['All']);
      }
      next.delete('All');
      if (next.has(f)) {
        next.delete(f);
        if (next.size === 0) next.add('All');
      } else {
        next.add(f);
      }
      return next;
    });
  };

  const activeFilterCount = indexFilters.has('All') ? 0 : indexFilters.size;

  // Process sorting/filtering pipeline
  const afterContentType = bookmarkedSources.filter((s) => {
    if (contentTypeFilter !== 'All') {
      const ct = s.content_type?.toLowerCase() || '';
      switch (contentTypeFilter) {
        case 'Articles': return ct === 'article' || ct === 'journal-article';
        case 'Journals': return ct === 'journal' || ct === 'journal-article';
        case 'Books': return ct === 'book' || ct === 'book-chapter';
      }
    }
    return true;
  });

  const afterIndexFilter = filterByIndexes(afterContentType, indexFilters);

  const afterSearch = searchQuery.trim()
    ? afterIndexFilter.filter((s) => {
        const query = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(query) ||
          s.authors.join(' ').toLowerCase().includes(query) ||
          (s.publisher && s.publisher.toLowerCase().includes(query))
        );
      })
    : afterIndexFilter;

  const filtered = sortSources(afterSearch, sort);

  const sortOptionLabels: Record<SortOption, string> = {
    relevance: 'Most Relevant',
    newest: 'Newest First',
    oldest: 'Oldest First',
    title: 'Title (A-Z)',
  };

  const currentSortLabel = sortOptionLabels[sort] ?? 'Sort';

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
            {/* Toolbar Layout */}
            <div className="flex flex-col gap-4 pb-4 border-b border-cloud-canvas dark:border-stone-gray">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                {/* Content Type Filter Tabs */}
                <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-cloud-canvas dark:border-stone-gray shrink-0 max-w-fit">
                  {(['All', 'Articles', 'Journals', 'Books'] as const).map((ct) => (
                    <button
                      key={ct}
                      onClick={() => setContentTypeFilter(ct)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        contentTypeFilter === ct
                          ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                          : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                      }`}
                    >
                      {ct}
                    </button>
                  ))}
                </div>

                {/* Sort + Filter + Count */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:ml-auto">
                  {/* Sort By Dropdown */}
                  <Dropdown
                    align="left"
                    trigger={
                      <button className="flex items-center gap-1.5 h-9 px-3 border border-cloud-canvas dark:border-stone-gray rounded-lg text-xs font-medium text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors cursor-pointer whitespace-nowrap">
                        <Filter className="w-3.5 h-3.5" />
                        {currentSortLabel}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    {SORT_OPTIONS.map((o) => (
                      <DropdownItem key={o.value} label={sortOptionLabels[o.value]} active={sort === o.value} onClick={() => setSort(o.value)} />
                    ))}
                  </Dropdown>

                  {/* Filters Toggle Button */}
                  <button
                    onClick={() => setShowFilters((f) => !f)}
                    className={`flex items-center gap-1.5 h-9 px-3 border rounded-lg text-xs font-medium transition-colors ${
                      showFilters || activeFilterCount > 0
                        ? 'border-fuenzer-teal text-fuenzer-teal bg-fuenzer-teal/10'
                        : 'border-cloud-canvas dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-fuenzer-teal text-white text-[9px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <span className="text-xs font-bold text-slate-gray dark:text-silver-mist uppercase tracking-wider font-sans ml-auto sm:ml-2 whitespace-nowrap">
                    {filtered.length} sources
                  </span>
                </div>
              </div>

              {/* Index Filters Checklist */}
              {showFilters && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 bg-cloud-canvas/20 dark:bg-stone-gray/10 p-3.5 rounded-xl border border-cloud-canvas dark:border-stone-gray">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-silver-mist">Index Filter</span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setIndexFilters(new Set(['All']))}
                        className="text-[10px] font-bold text-fuenzer-teal hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {INDEX_FILTERS.map((f) => {
                      const checked = indexFilters.has(f);
                      return (
                        <button
                          key={f}
                          onClick={() => toggleIndexFilter(f)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            checked
                              ? 'bg-fuenzer-teal text-white border-fuenzer-teal'
                              : 'border-cloud-canvas dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:border-fuenzer-teal/60 hover:text-fuenzer-teal'
                          }`}
                        >
                          {checked
                            ? <CheckSquare className="w-3 h-3 shrink-0" />
                            : <Square className="w-3 h-3 shrink-0" />
                          }
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray shadow-sm">
                No references match your search and filter criteria.
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
