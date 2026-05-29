import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
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
  FileText,
  X,
  SlidersHorizontal,
  CheckSquare,
  Square,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SortOption = 'relevance' | 'newest' | 'oldest' | 'citations';
type CitationStyle = 'APA' | 'Harvard' | 'MLA' | 'Chicago' | 'Vancouver';
type FilterIndex = 'All' | 'SINTA 1' | 'SINTA 2' | 'SINTA 3' | 'SINTA 4' | 'SINTA 5' | 'SINTA 6' | 'Scopus' | 'Garuda';
type ContentTypeTab = 'All' | 'Articles' | 'Journals' | 'Books';

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
  const [sort, setSort] = useState<SortOption>('relevance');
  // Multi-select: start with Set containing 'All'
  const [indexFilters, setIndexFilters] = useState<Set<FilterIndex>>(new Set(['All']));
  const [citation, setCitation] = useState<CitationStyle>('APA');
  const [searchRef, setSearchRef] = useState('');
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeTab>('All');

  const navigate = useNavigate();
  const { query, messages, bookmarkedSources, toggleBookmark } = useResearchStore();
  const { language } = useUiStore();
  const t = language === 'en' ? en.playground : id.playground;

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
  
  // Content type filtering
  const afterContentType = contentTypeFilter === 'All'
    ? afterIndexFilter
    : afterIndexFilter.filter((s) => {
        const ct = s.content_type?.toLowerCase() || '';
        switch (contentTypeFilter) {
          case 'Articles': return ct === 'article';
          case 'Journals': return ct === 'journal-article'; // articles from journals only!
          case 'Books': return ct === 'book' || ct === 'book-chapter';
          default: return true;
        }
      });

  const afterSearch = searchRef.trim()
    ? afterContentType.filter(
        (s) =>
            s.title.toLowerCase().includes(searchRef.toLowerCase()) ||
            s.authors.join(' ').toLowerCase().includes(searchRef.toLowerCase())
      )
    : afterContentType;
  const sorted = sortSources(afterSearch, sort);
  const displayedRefs = sorted;

  const sortOptionLabels: Record<SortOption, string> = {
    relevance: t.sortRelevance,
    newest: t.sortNewest,
    oldest: t.sortOldest,
    citations: t.sortCitations,
  };

  const currentSortLabel = sortOptionLabels[sort] ?? 'Sort';

  const handleExportPDF = () => {
    alert(t.exportPDFMsg);
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

        {/* Right Panel: References — scrolls naturally with content */}
        <section className="flex-1 flex flex-col bg-paper-white dark:bg-ink-black relative transition-colors overflow-y-auto min-w-0">

          {/* ── Toolbar ───────────────────────────────────────────────── */}
          <div className="px-4 md:px-6 pt-4 pb-3 border-b border-cloud-canvas dark:border-stone-gray shrink-0 flex flex-col gap-3">

            {/* Row 1: Toggle + Title + Tabs + Citation + Export */}
            <div className="flex items-center gap-1.5 md:gap-3 flex-wrap md:flex-nowrap">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors rounded-lg hover:bg-cloud-canvas dark:hover:bg-stone-gray shrink-0"
                title={t.sidebarToggle}
              >
                <PanelLeft className="w-5 h-5" />
              </button>

              <h2 className="text-base md:text-2xl font-bold text-ink-black dark:text-paper-white font-serif shrink-0 mr-2">
                {t.referencesTitle}
              </h2>

              {/* Content Type Filter Chips */}
              <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-cloud-canvas dark:border-stone-gray shrink-0 w-full md:w-auto order-3 md:order-0 mt-2 md:mt-0 justify-between md:justify-start">
                {(['All', 'Articles', 'Journals', 'Books'] as const).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setContentTypeFilter(ct)}
                    className={`px-2.5 py-1 md:px-3 md:py-1.5 text-xs font-semibold rounded-md transition-all flex-1 md:flex-none text-center ${
                      contentTypeFilter === ct
                        ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                        : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto shrink-0 order-2 md:order-0">
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
                    <button className="flex items-center gap-1 md:gap-1.5 h-8 px-2 md:px-3 bg-fuenzer-teal/10 text-fuenzer-teal-dark dark:text-fuenzer-teal rounded-lg text-xs font-semibold hover:bg-fuenzer-teal/20 transition-colors cursor-pointer shrink-0">
                      <Download className="w-3.5 h-3.5" />
                      Export
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  }
                >
                  <DropdownItem label={t.exportPDF} onClick={handleExportPDF} />
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
                  placeholder={t.searchPlaceholder}
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
                  <DropdownItem key={o.value} label={sortOptionLabels[o.value]} active={sort === o.value} onClick={() => setSort(o.value)} />
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
                  <span className="text-[10px] uppercase tracking-widest font-bold text-silver-mist">{t.filterIndex}</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => setIndexFilters(new Set(['All']))}
                      className="text-[10px] font-bold text-fuenzer-teal hover:underline"
                    >
                      {t.clearFilters}
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

          {/* ── Content Area ── */}
          <div className="flex-1 flex flex-col bg-cloud-canvas/30 dark:bg-[#121212]/50">
            <div className="p-4 md:p-6 min-h-full flex flex-col">

              {/* No match after filter */}
              {latestResponse && displayedRefs.length === 0 && !isLoading && (
                <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray">
                  {t.noFiltersMatch}
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
                        isBookmarked={bookmarkedSources.some((b) => b.id === source.id)}
                        onToggleBookmark={() => toggleBookmark(source)}
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

              {/* Empty state */}
              {!latestResponse && !isLoading && (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-5 flex-1">
                  <div className="w-20 h-20 rounded-2xl bg-cloud-canvas dark:bg-stone-gray/50 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-silver-mist" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-ink-black dark:text-paper-white">{t.noRefsYet}</p>
                    <p className="text-xs text-silver-mist max-w-[260px] leading-relaxed">
                      {t.noRefsYetDesc}
                    </p>
                  </div>
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
