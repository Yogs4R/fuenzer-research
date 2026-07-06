import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
import type { AcademicSource } from '../types/research';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useSEO } from '../hooks/useSEO';
import { getFormattedCitation, type CitationStyle, CITATION_STYLES } from '../utils/citationFormatter';
import { generateBibTeX, generateRIS } from '../utils/citationExporter';
import { Dropdown, DropdownItem } from '../components/shared/Dropdown';
import {
  type SortOption,
  type FilterIndex,
  INDEX_FILTERS,
  sortSources,
  filterByIndexes,
} from '../utils/researchFilters';
import {
  FileText,
  Copy,
  Check,
  Download,
  ArrowRight,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Filter,
  ChevronDown,
  Folder,
} from 'lucide-react';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
];

export function CitationsPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/citations/',
  });
  const navigate = useNavigate();
  const {
    bookmarkedSources,
    libraries,
    activeLibraryId,
    setActiveLibraryId,
  } = useResearchStore();
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<'All' | 'Articles' | 'Journals' | 'Books'>('All');
  
  // Search, Sort, Filters States
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [indexFilters, setIndexFilters] = useState<Set<FilterIndex>>(new Set(['All']));
  const [showFilters, setShowFilters] = useState(false);

  const { language } = useUiStore();
  const t = language === 'en' ? en.citations : id.citations;

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

  // Pipeline execution
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

  const filteredSources = sortSources(afterSearch, sort);

  // Copy single citation to clipboard
  const handleCopySingle = async (source: AcademicSource) => {
    const text = getFormattedCitation(source, selectedStyle);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(source.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Copy all citations to clipboard
  const handleCopyAll = async () => {
    if (filteredSources.length === 0) return;
    const allText = filteredSources
      .map((s) => getFormattedCitation(s, selectedStyle))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Download BibTeX file
  const handleDownloadBibTeX = () => {
    if (filteredSources.length === 0) return;
    const bibText = generateBibTeX(filteredSources);
    const blob = new Blob([bibText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fuenzer_citations.bib';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download RIS file
  const handleDownloadRIS = () => {
    if (filteredSources.length === 0) return;
    const risText = generateRIS(filteredSources);
    const blob = new Blob([risText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fuenzer_citations.ris';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortOptionLabels: Record<SortOption, string> = {
    relevance: 'Most Relevant',
    newest: 'Newest First',
    oldest: 'Oldest First',
    citations: 'Most Cited',
    title: 'Title (A-Z)',
  };

  const currentSortLabel = sortOptionLabels[sort] ?? 'Sort';

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Hero header */}
      <section className="bg-paper-white dark:bg-ink-black border-b border-frost-gray dark:border-stone-gray py-12 px-6 md:px-8 transition-colors shrink-0">
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

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {/* Library Selector Dropdown */}
            <div className="flex items-center gap-2 font-sans select-none shrink-0 border border-frost-gray dark:border-stone-gray rounded-xl p-1 bg-cloud-canvas/20 dark:bg-stone-gray/10">
              <span className="text-[10px] uppercase font-bold text-slate-gray pl-2">{language === 'en' ? 'Library:' : 'Pustaka:'}</span>
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-bold text-ink-black dark:text-paper-white hover:bg-cloud-canvas/30 dark:hover:bg-stone-gray/25 transition-colors cursor-pointer">
                    <Folder className="w-3.5 h-3.5 text-fuenzer-teal shrink-0" />
                    <span>{libraries.find(l => l.id === activeLibraryId)?.name || 'Library'}</span>
                    <ChevronDown className="w-3 h-3 text-silver-mist" />
                  </button>
                }
              >
                {libraries.map((lib) => (
                  <DropdownItem
                    key={lib.id}
                    label={lib.name}
                    active={activeLibraryId === lib.id}
                    onClick={() => setActiveLibraryId(lib.id)}
                  />
                ))}
              </Dropdown>
            </div>

            {/* Action buttons */}
            {bookmarkedSources.length > 0 && (
              <div className="flex items-center gap-3 font-sans shrink-0">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? t.copiedAll : t.copyAll}
              </button>
              <Dropdown
                align="right"
                trigger={
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-frost-gray dark:border-stone-gray bg-paper-white dark:bg-ink-black text-slate-gray dark:text-cloud-canvas text-xs font-bold hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-silver-mist" />
                    Export
                    <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
                  </button>
                }
              >
                <DropdownItem label={t.exportBibtex} onClick={handleDownloadBibTeX} />
                <DropdownItem label={t.exportRis} onClick={handleDownloadRIS} />
              </Dropdown>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-10 font-sans flex flex-col">
        {bookmarkedSources.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-fuenzer-teal/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-fuenzer-teal/20 to-transparent scale-0 group-hover:scale-100 transition-transform duration-500 rounded-3xl" />
              <FileText className="w-10 h-10 text-fuenzer-teal relative z-10" strokeWidth={1.5} />
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
          /* Citations formatter area */
          <div className="space-y-6 flex-1">
            {/* Search, Tabs, Sort, and Filters Row */}
            <div className="flex flex-col gap-4 pb-4 border-b border-frost-gray dark:border-stone-gray">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
                {/* Search Bar + Tabs */}
                <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
                  {/* Search bar */}
                  <div className="flex items-center border border-frost-gray dark:border-stone-gray rounded-xl px-3 h-10 hover:border-silver-mist focus-within:border-fuenzer-teal bg-cloud-canvas/30 dark:bg-stone-gray/30 transition-colors w-full sm:w-64 font-sans">
                    <Search className="w-4 h-4 text-silver-mist shrink-0 mr-2" />
                    <input
                      type="text"
                      placeholder="Search citations..."
                      className="flex-1 h-full text-sm outline-none bg-transparent dark:text-cloud-canvas placeholder:text-silver-mist"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-silver-mist hover:text-ink-black dark:hover:text-paper-white shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content Type Tabs */}
                  <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-frost-gray dark:border-stone-gray shrink-0 max-w-fit">
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
                </div>

                {/* Sort + Filter + Sources Count */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:ml-auto">
                  {/* Sort By Dropdown */}
                  <Dropdown
                    align="left"
                    trigger={
                      <button className="flex items-center gap-1.5 h-10 px-3 border border-frost-gray dark:border-stone-gray rounded-xl text-xs font-medium text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors cursor-pointer whitespace-nowrap">
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
                    className={`flex items-center gap-1.5 h-10 px-3 border rounded-xl text-xs font-medium transition-colors ${
                      showFilters || activeFilterCount > 0
                        ? 'border-fuenzer-teal text-fuenzer-teal bg-fuenzer-teal/10'
                        : 'border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
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
                    {filteredSources.length} sources
                  </span>
                </div>
              </div>

              {/* Index Filters Checklist */}
              {showFilters && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 bg-cloud-canvas/20 dark:bg-stone-gray/10 p-3.5 rounded-xl border border-frost-gray dark:border-stone-gray">
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
                              : 'border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:border-fuenzer-teal/60 hover:text-fuenzer-teal'
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

            {/* Style switcher row */}
            <div className="flex items-center justify-between pb-3 border-b border-frost-gray dark:border-stone-gray">
              <div className="flex items-center gap-2 flex-wrap">
                {CITATION_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedStyle === style
                        ? 'bg-fuenzer-teal/10 text-fuenzer-teal border-fuenzer-teal/30 shadow-xs'
                        : 'border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:text-fuenzer-teal hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
                    }`}
                  >
                    {style} Format
                  </button>
                ))}
              </div>
            </div>

            {/* List of generated citations */}
            <div className="space-y-4">
              {filteredSources.length === 0 ? (
                <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-frost-gray dark:border-stone-gray shadow-sm">
                  No citations match your search and filter criteria.
                </div>
              ) : (
                filteredSources.map((source) => {
                  const text = getFormattedCitation(source, selectedStyle);
                  const isCopied = copiedId === source.id;
                  return (
                    <div
                      key={source.id}
                      className="p-5 bg-paper-white dark:bg-ink-black border border-frost-gray dark:border-stone-gray hover:border-silver-mist/50 dark:hover:border-stone-gray/70 rounded-2xl shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                        <p className="text-xs font-bold text-fuenzer-teal-dark dark:text-fuenzer-teal uppercase tracking-wider font-sans">
                          {source.title}
                        </p>
                        <p className="text-[13px] text-ink-black dark:text-cloud-canvas leading-relaxed select-all">
                          {text}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopySingle(source)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ml-auto border cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                            : 'bg-cloud-canvas/30 hover:bg-cloud-canvas/70 dark:bg-stone-gray/20 dark:hover:bg-stone-gray/40 border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? t.copiedSingle : t.copySingle}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
