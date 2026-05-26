import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { JournalCard } from '../components/shared/JournalCard';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { AIAssistantPanel } from '../components/playground/AIAssistantPanel';
import type { AcademicSource } from '../types/research';
import {
  Search,
  BookOpen,
  Download,
  Filter,
  ChevronDown,
  PanelLeft,
  Bookmark,
  BookmarkCheck,
  FileText,
  X,
  SlidersHorizontal,
  FlaskConical,
  CheckSquare,
  Square,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortOption = 'relevance' | 'newest' | 'oldest' | 'citations';
type CitationStyle = 'APA' | 'Harvard' | 'MLA' | 'Chicago' | 'Vancouver';
type FilterIndex = 'All' | 'SINTA 1' | 'SINTA 2' | 'SINTA 3' | 'SINTA 4' | 'SINTA 5' | 'SINTA 6' | 'Scopus' | 'Garuda';
type ViewTab = 'all' | 'bookmarked';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'citations', label: 'Most Cited' },
];

const CITATION_STYLES: CitationStyle[] = ['APA', 'Harvard', 'MLA', 'Chicago', 'Vancouver'];

const INDEX_FILTERS: FilterIndex[] = ['All', 'SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'SINTA 5', 'SINTA 6', 'Scopus', 'Garuda'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sortSources(sources: AcademicSource[], sort: SortOption): AcademicSource[] {
  const copy = [...sources];
  if (sort === 'newest') return copy.sort((a, b) => b.year - a.year);
  if (sort === 'oldest') return copy.sort((a, b) => a.year - b.year);
  return copy;
}

// Multi-select filter: matches if source has ANY of the selected indexes
function filterByIndexes(sources: AcademicSource[], filters: Set<FilterIndex>): AcademicSource[] {
  if (filters.has('All') || filters.size === 0) return sources;
  return sources.filter((s) =>
    [...filters].some((f) => {
      if (f === 'Scopus') return s.indexes.some((i) => i.provider.toLowerCase() === 'scopus');
      if (f === 'Garuda') return s.indexes.some((i) => i.provider.toLowerCase() === 'garuda');
      const tier = f.split(' ')[1]; // 'SINTA 1' → '1'
      return s.indexes.some((i) => i.provider.toLowerCase() === 'sinta' && i.tier === tier);
    })
  );
}

// ─── Reusable Dropdown ────────────────────────────────────────────────────────
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
    <div className="relative" ref={ref}>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export function PlaygroundPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tab, setTab] = useState<ViewTab>('all');
  const [sort, setSort] = useState<SortOption>('relevance');
  // Multi-select: start with Set containing 'All'
  const [indexFilters, setIndexFilters] = useState<Set<FilterIndex>>(new Set(['All']));
  const [citation, setCitation] = useState<CitationStyle>('APA');
  const [searchRef, setSearchRef] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { query, messages, loadDemoData } = useResearchStore();

  // Redirect only if neither query nor messages (handles history navigation with empty messages)
  useEffect(() => {
    if (!query.trim() && messages.length === 0) {
      navigate('/');
    }
  }, [query, messages, navigate]);

  // Latest complete AI response for the references panel
  const latestAiMsg = [...messages].reverse().find(
    (m) => m.role === 'ai' && m.phase === 'complete' && m.response
  );
  const latestResponse = latestAiMsg?.response ?? null;

  const isLoading = messages.some(
    (m) => m.role === 'ai' && (m.phase === 'searching' || m.phase === 'filtering' || m.phase === 'synthesizing')
  );

  // Toggle single bookmark
  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle single selection
  const toggleSelection = (id: string) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Multi-select index filter toggle
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

  // Process references pipeline
  const allRefs = latestResponse?.references ?? [];
  const afterIndexFilter = filterByIndexes(allRefs, indexFilters);
  const afterSearch = searchRef.trim()
    ? afterIndexFilter.filter(
        (s) =>
          s.title.toLowerCase().includes(searchRef.toLowerCase()) ||
          s.authors.join(' ').toLowerCase().includes(searchRef.toLowerCase())
      )
    : afterIndexFilter;
  const sorted = sortSources(afterSearch, sort);
  const bookmarkedRefs = sorted.filter((s) => bookmarks.has(s.id));
  const displayedRefs = tab === 'bookmarked' ? bookmarkedRefs : sorted;

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  const handleExportPDF = () => {
    alert('PDF export coming soon!');
  };

  return (
    <div className="h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif transition-colors overflow-hidden">
      <Navbar mode="playground" />

      {/* Main content — fixed height, no page scroll */}
      <main className="flex-1 flex flex-col md:flex-row bg-cloud-canvas dark:bg-stone-gray gap-px font-sans overflow-hidden">
        {/* Left Panel: AI Assistant */}
        <AIAssistantPanel
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Right Panel: References — its own scroll context */}
        <section className="flex-1 flex flex-col bg-paper-white dark:bg-ink-black relative transition-colors overflow-hidden">

          {/* ── Sticky Toolbar ───────────────────────────────────────────────── */}
          <div className="px-4 md:px-6 pt-4 pb-3 border-b border-cloud-canvas dark:border-stone-gray shrink-0 flex flex-col gap-3">

            {/* Row 1: Toggle + Title + Tabs + Citation + Export */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors rounded-lg hover:bg-cloud-canvas dark:hover:bg-stone-gray shrink-0"
                title="Toggle AI Assistant"
              >
                <PanelLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-ink-black dark:text-paper-white font-serif shrink-0">
                References
              </h2>

              {/* Tab switcher */}
              <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-cloud-canvas dark:border-stone-gray">
                <button
                  onClick={() => setTab('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    tab === 'all'
                      ? 'bg-paper-white dark:bg-ink-black text-ink-black dark:text-cloud-canvas shadow-sm'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  All
                  {allRefs.length > 0 && (
                    <span className="ml-1 text-[10px] bg-cloud-canvas dark:bg-stone-gray px-1.5 py-0.5 rounded-full font-bold">
                      {allRefs.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab('bookmarked')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                    tab === 'bookmarked'
                      ? 'bg-paper-white dark:bg-ink-black text-fuenzer-teal shadow-sm'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  <Bookmark className="w-3 h-3" />
                  Saved
                  {bookmarks.size > 0 && (
                    <span className="text-[10px] bg-fuenzer-teal/20 text-fuenzer-teal px-1.5 py-0.5 rounded-full font-bold">
                      {bookmarks.size}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Citation style dropdown */}
                <Dropdown
                  trigger={
                    <button className="hidden md:flex items-center gap-1.5 border border-cloud-canvas dark:border-stone-gray px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-silver-mist" />
                      {citation}
                      <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
                    </button>
                  }
                >
                  {CITATION_STYLES.map((s) => (
                    <DropdownItem key={s} label={s} active={citation === s} onClick={() => setCitation(s)} />
                  ))}
                </Dropdown>

                {/* Export dropdown */}
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-1.5 h-8 px-3 bg-fuenzer-teal/10 text-fuenzer-teal-dark dark:text-fuenzer-teal rounded-lg text-xs font-semibold hover:bg-fuenzer-teal/20 transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      Export
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  }
                >
                  <DropdownItem label="Export as PDF" onClick={handleExportPDF} />
                </Dropdown>
              </div>
            </div>

            {/* Row 2: Search + Sort + Filters toggle + Mobile Citation */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search bar — narrower, w-56 on desktop */}
              <div className="flex items-center border border-cloud-canvas dark:border-stone-gray rounded-lg px-3 h-9 hover:border-silver-mist focus-within:border-fuenzer-teal transition-colors w-full md:w-56">
                <Search className="w-3.5 h-3.5 text-silver-mist shrink-0" />
                <input
                  type="text"
                  placeholder="Search references..."
                  className="flex-1 h-full px-2 text-sm outline-none bg-transparent dark:text-cloud-canvas placeholder:text-silver-mist min-w-0"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                />
                {searchRef && (
                  <button onClick={() => setSearchRef('')} className="text-silver-mist hover:text-ink-black dark:hover:text-paper-white shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort by */}
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
                  <DropdownItem key={o.value} label={o.label} active={sort === o.value} onClick={() => setSort(o.value)} />
                ))}
              </Dropdown>

              {/* Filters toggle */}
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

              {/* Mobile: citation style */}
              <div className="md:hidden ml-auto">
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-1 border border-cloud-canvas dark:border-stone-gray px-2.5 py-1.5 rounded-lg text-xs font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer">
                      <FileText className="w-3 h-3 text-silver-mist" />
                      {citation}
                      <ChevronDown className="w-3 h-3 text-silver-mist" />
                    </button>
                  }
                >
                  {CITATION_STYLES.map((s) => (
                    <DropdownItem key={s} label={s} active={citation === s} onClick={() => setCitation(s)} />
                  ))}
                </Dropdown>
              </div>
            </div>

            {/* Row 3: Multi-select checkbox filters (expandable) */}
            {showFilters && (
              <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
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

          {/* ── Scrollable Content Area (Footer lives here, only visible on scroll) ── */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 md:p-6 bg-cloud-canvas/30 dark:bg-[#121212]/50 flex-1 flex flex-col">

              {/* Bookmarked empty state */}
              {tab === 'bookmarked' && bookmarkedRefs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-fuenzer-teal/10 flex items-center justify-center">
                    <BookmarkCheck className="w-8 h-8 text-fuenzer-teal/50" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-black dark:text-paper-white mb-1">No saved references yet</p>
                    <p className="text-xs text-silver-mist max-w-[240px] leading-relaxed">
                      Click the bookmark icon on any reference card to save it here for quick access.
                    </p>
                  </div>
                </div>
              )}

              {/* No match after filter */}
              {tab === 'all' && latestResponse && displayedRefs.length === 0 && !isLoading && (
                <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray">
                  No references match your current filters.
                </div>
              )}

              {/* Reference cards */}
              {displayedRefs.length > 0 && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {displayedRefs.map((source) => (
                    <div key={source.id} className="relative group">
                      <JournalCard 
                        source={source} 
                        isSelected={selectedRefs.has(source.id)}
                        onToggleSelect={() => toggleSelection(source.id)}
                        isBookmarked={bookmarks.has(source.id)}
                        onToggleBookmark={() => toggleBookmark(source.id)}
                        citationStyle={citation}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-paper-white dark:bg-ink-black rounded-xl p-6 shadow-subtle border border-cloud-canvas dark:border-stone-gray animate-pulse"
                    >
                      <div className="h-5 bg-cloud-canvas dark:bg-stone-gray rounded w-3/4 mb-3" />
                      <div className="h-3 bg-cloud-canvas dark:bg-stone-gray rounded w-1/2 mb-5" />
                      <div className="h-3 bg-cloud-canvas dark:bg-stone-gray rounded w-1/4" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for "All" tab — friendly with demo button */}
              {messages.length === 0 && !isLoading && tab === 'all' && (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-5 flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-cloud-canvas dark:bg-stone-gray/50 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-silver-mist" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-ink-black dark:text-paper-white">No references yet</p>
                    <p className="text-xs text-silver-mist max-w-[260px] leading-relaxed">
                      Ask a question in the AI Assistant on the left to generate your first literature review.
                    </p>
                  </div>
                  <button
                    onClick={() => loadDemoData()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-cloud-canvas dark:border-stone-gray text-xs font-semibold text-slate-gray dark:text-silver-mist hover:border-fuenzer-teal hover:text-fuenzer-teal transition-all"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    Load demo data to preview buttons
                  </button>
                </div>
              )}

              {/* Footer — only visible when scrolling down */}
              <div className="mt-auto pt-12">
                <Footer />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
