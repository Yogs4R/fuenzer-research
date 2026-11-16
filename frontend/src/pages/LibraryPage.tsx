import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useSEO } from '../hooks/useSEO';
import { en } from '../locales/en';
import { id } from '../locales/id';
import { JournalCard } from '../components/shared/JournalCard';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Dropdown, DropdownItem } from '../components/shared/Dropdown';
import { LibraryCompareView } from '../components/library/LibraryCompareView';
import { SaveToLibraryModal } from '../components/shared/SaveToLibraryModal';
import type { AcademicSource } from '../types/research';
import {
  type SortOption,
  type FilterIndex,
  INDEX_FILTERS,
} from '../utils/researchFilters';
import {
  type ContentTypeFilter,
  SORT_OPTION_LABELS,
  toggleIndexFilterValue,
  filterAndSortSources,
} from '../utils/sourcePipeline';
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
  Check,
  Trash2,
  Folder,
  Plus,
  Globe,
  Lock,
  Link2,
} from 'lucide-react';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title (A-Z)' },
];

export function LibraryPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/library/',
  });
  const navigate = useNavigate();
  const {
    bookmarkedSources,
    libraries,
    activeLibraryId,
    createFolder,
    removeFolder,
    togglePublicStatus,
    setActiveLibraryId,
    isBookmarkedInAnyLibrary,
    toggleBookmarkInLibrary,
  } = useResearchStore();
  const [newFolderInput, setNewFolderInput] = useState('');
  const [copiedLibId, setCopiedLibId] = useState<string | null>(null);
  const [bookmarkModalSource, setBookmarkModalSource] = useState<AcademicSource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('All');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [indexFilters, setIndexFilters] = useState<Set<FilterIndex>>(new Set(['All']));
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');
  const [selectedDeleteRefs, setSelectedDeleteRefs] = useState<Set<string>>(new Set());

  const { language } = useUiStore();
  const t = language === 'en' ? en.library : id.library;
  const { user } = useAuthStore();

  const activeLib = libraries.find((lib) => lib.id === activeLibraryId);
  const storageKey = user
    ? user.isAnonymous
      ? `fuenzer_library_compare_chat_guest_${activeLibraryId}`
      : `fuenzer_library_compare_chat_${user.uid}_${activeLibraryId}`
    : `fuenzer_library_compare_chat_guest_${activeLibraryId}`;

  const handleSwitchLibrary = (libId: string) => {
    setSelectedDeleteRefs(new Set());
    void setActiveLibraryId(libId);
  };

  const handleSwitchViewMode = (mode: 'list' | 'compare') => {
    setSelectedDeleteRefs(new Set());
    setViewMode(mode);
  };

  const toggleDeleteRef = (sourceId: string) => {
    setSelectedDeleteRefs((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedDeleteRefs.size === 0) return;
    const confirmMsg =
      language === 'id'
        ? `Apakah Anda yakin ingin menghapus ${selectedDeleteRefs.size} referensi terpilih dari pustaka ini?`
        : `Are you sure you want to remove the ${selectedDeleteRefs.size} selected references from this library?`;
    if (!window.confirm(confirmMsg)) return;

    for (const sourceId of selectedDeleteRefs) {
      const source = bookmarkedSources.find((s) => s.id === sourceId);
      if (source) {
        await toggleBookmarkInLibrary(activeLibraryId, source);
      }
    }
    setSelectedDeleteRefs(new Set());
  };

  const toggleIndexFilter = (f: FilterIndex) => {
    setIndexFilters((prev) => toggleIndexFilterValue(prev, f));
  };

  const activeFilterCount = indexFilters.has('All') ? 0 : indexFilters.size;
  const filtered = filterAndSortSources(bookmarkedSources, {
    contentType: contentTypeFilter,
    indexFilters,
    searchQuery,
    sort,
  });
  const currentSortLabel = SORT_OPTION_LABELS[sort] ?? 'Sort';

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Hero header */}
      <section className="bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray py-10 md:py-12 px-6 md:px-8 transition-colors shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fuenzer-teal">
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">{t.badge}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink-black dark:text-paper-white leading-tight">
              {t.title}
            </h1>
            <p className="text-sm font-sans text-slate-gray dark:text-silver-mist max-w-xl">
              {t.desc}
            </p>
          </div>

          {/* View Toggle + Search Bar */}
          {bookmarkedSources.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 font-sans">
              <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-frost-gray dark:border-stone-gray select-none w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => handleSwitchViewMode('list')}
                  className={`min-h-9 px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  {t.tabMyLibrary}
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchViewMode('compare')}
                  className={`min-h-9 px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'compare'
                      ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-fuenzer-teal shrink-0" aria-hidden="true" />
                  {t.tabAiCompare}
                </button>
              </div>

              {viewMode === 'list' && (
                <div className="flex items-center border border-frost-gray dark:border-stone-gray rounded-xl px-4 h-11 hover:border-silver-mist focus-within:border-fuenzer-teal bg-cloud-canvas/30 dark:bg-stone-gray/30 transition-colors w-full md:w-64 font-sans">
                  <Search className="w-4 h-4 text-silver-mist shrink-0 mr-2.5" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    className="flex-1 h-full text-sm outline-none bg-transparent dark:text-cloud-canvas placeholder:text-silver-mist min-w-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-8 md:py-10 font-sans grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Folder List */}
        <aside className="lg:col-span-1 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-cloud-canvas dark:border-stone-gray pb-6 lg:pb-0 lg:pr-6 shrink-0 h-fit">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-gray dark:text-silver-mist">
              {language === 'en' ? 'My Libraries' : 'Pustaka Saya'}
            </h3>

            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {libraries.map((lib) => {
                const isActive = activeLibraryId === lib.id;
                const isPublic = lib.isPublic;

                return (
                  <button
                    key={lib.id}
                    type="button"
                    onClick={() => handleSwitchLibrary(lib.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`w-full text-left group flex items-center justify-between px-3 min-h-11 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
                      isActive
                        ? 'bg-fuenzer-teal/10 border-l-2 border-fuenzer-teal text-fuenzer-teal'
                        : 'text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/40 dark:hover:bg-stone-gray/10 hover:text-ink-black dark:hover:text-paper-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder className={`w-4 h-4 shrink-0 ${isActive ? 'text-fuenzer-teal' : 'text-slate-gray/70'}`} aria-hidden="true" />
                      <span className="truncate">{lib.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isPublic && (
                        <span title={language === 'en' ? 'Public' : 'Publik'}>
                          <Globe className="w-3.5 h-3.5 text-fuenzer-teal" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {(!user || user.isAnonymous) && (
              <div className="mt-2 text-[10px] text-slate-gray/80 dark:text-silver-mist/80 bg-cloud-canvas/20 dark:bg-stone-gray/10 p-2.5 rounded-xl border border-cloud-canvas/30 dark:border-stone-gray/10 leading-normal font-sans">
                {t.shareNoticeGuest}
              </div>
            )}
          </div>

          {/* Add Folder Form */}
          <div className="pt-4 border-t border-cloud-canvas/60 dark:border-stone-gray/20">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newFolderInput.trim()) return;
                await createFolder(newFolderInput.trim());
                setNewFolderInput('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder={language === 'en' ? 'New folder name...' : 'Folder baru...'}
                aria-label={language === 'en' ? 'New folder name' : 'Nama folder baru'}
                value={newFolderInput}
                onChange={(e) => setNewFolderInput(e.target.value)}
                className="flex-1 min-h-11 px-3 py-1.5 text-xs rounded-xl border border-cloud-canvas dark:border-stone-gray bg-white/60 dark:bg-ink-black/60 text-ink-black dark:text-paper-white focus:outline-hidden focus:ring-1 focus:ring-fuenzer-teal font-sans min-w-0"
                maxLength={40}
              />
              <button
                type="submit"
                className="min-h-11 min-w-11 flex items-center justify-center bg-fuenzer-teal text-white rounded-xl hover:bg-fuenzer-teal-dark transition-colors cursor-pointer shrink-0"
                title={language === 'en' ? 'Create Folder' : 'Buat Folder'}
                aria-label={language === 'en' ? 'Create Folder' : 'Buat Folder'}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-3 flex flex-col min-w-0">
          {activeLib && (
            <div className="mb-6 p-4 md:p-5 bg-paper-white dark:bg-ink-black rounded-2xl border border-cloud-canvas dark:border-stone-gray shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuenzer-teal/10 flex items-center justify-center shrink-0">
                  <Folder className="w-5 h-5 text-fuenzer-teal" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink-black dark:text-paper-white font-sans flex items-center gap-2">
                    {activeLib.name}
                    {activeLib.id === 'default' && (
                      <span className="text-[10px] bg-slate-gray/10 text-slate-gray px-1.5 py-0.5 rounded font-medium">
                        {language === 'en' ? 'Default' : 'Bawaan'}
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-gray dark:text-silver-mist font-sans">
                    {t.folderSettings}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {user && !user.isAnonymous ? (
                  <button
                    type="button"
                    onClick={() => togglePublicStatus(activeLib.id, !activeLib.isPublic)}
                    className={`min-h-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer font-sans ${
                      activeLib.isPublic
                        ? 'bg-fuenzer-teal/10 border-fuenzer-teal/30 text-fuenzer-teal hover:bg-fuenzer-teal/15'
                        : 'border-cloud-canvas dark:border-stone-gray text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white hover:bg-cloud-canvas/30 dark:hover:bg-stone-gray/10'
                    }`}
                  >
                    {activeLib.isPublic ? (
                      <>
                        <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.publicStatus}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.privateStatus}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="min-h-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-cloud-canvas dark:border-stone-gray opacity-45 text-slate-gray dark:text-silver-mist cursor-not-allowed font-sans bg-cloud-canvas/10 dark:bg-stone-gray/5"
                    title={t.loginToMakePublic}
                  >
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.privateStatus} ({t.loginRequired})</span>
                  </button>
                )}

                {activeLib.isPublic && user && (
                  <button
                    type="button"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/shared/library/${user.uid}/${activeLib.id}`;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        setCopiedLibId(activeLib.id);
                        setTimeout(() => setCopiedLibId(null), 2000);
                      });
                    }}
                    className="min-h-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-cloud-canvas dark:border-stone-gray text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white cursor-pointer bg-paper-white dark:bg-ink-black hover:bg-cloud-canvas/30 dark:hover:bg-stone-gray/10 transition-all font-sans"
                  >
                    {copiedLibId === activeLib.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                        <span className="text-emerald-500">{t.copiedLink}</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.copyLink}</span>
                      </>
                    )}
                  </button>
                )}

                {(!user || user.isAnonymous) && (
                  <button
                    type="button"
                    disabled
                    className="min-h-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-cloud-canvas dark:border-stone-gray opacity-45 text-slate-gray dark:text-silver-mist cursor-not-allowed font-sans bg-cloud-canvas/10 dark:bg-stone-gray/5"
                    title={t.loginToCopyLink}
                  >
                    <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.copyLink}</span>
                  </button>
                )}

                {activeLib.id !== 'default' && (
                  <button
                    type="button"
                    onClick={() => {
                      const confirmMsg = t.deleteFolderConfirm.replace('{name}', activeLib.name);
                      if (window.confirm(confirmMsg)) {
                        removeFolder(activeLib.id);
                      }
                    }}
                    className="min-h-10 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-950/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer transition-all font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.deleteFolder}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {bookmarkedSources.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-fuenzer-teal/10 flex items-center justify-center shadow-inner">
                <BookmarkCheck className="w-10 h-10 text-fuenzer-teal" strokeWidth={1.5} aria-hidden="true" />
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
                type="button"
                onClick={() => navigate('/playground')}
                className="min-h-11 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer font-sans"
              >
                {t.searchButton}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : viewMode === 'compare' ? (
            <LibraryCompareView
              key={storageKey}
              bookmarkedSources={bookmarkedSources}
              storageKey={storageKey}
              language={language}
            />
          ) : (
            <div className="space-y-6 flex-1">
              <div className="flex flex-col gap-4 pb-4 border-b border-cloud-canvas dark:border-stone-gray">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                  <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-frost-gray dark:border-stone-gray shrink-0 max-w-fit">
                    {(['All', 'Articles', 'Journals', 'Books'] as const).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setContentTypeFilter(ct)}
                        className={`min-h-9 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          contentTypeFilter === ct
                            ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                            : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                        }`}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:ml-auto">
                    <Dropdown
                      align="left"
                      trigger={
                        <button
                          type="button"
                          className="flex items-center gap-1.5 min-h-10 px-3 border border-frost-gray dark:border-stone-gray rounded-lg text-xs font-medium text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                          {currentSortLabel}
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      }
                    >
                      {SORT_OPTIONS.map((o) => (
                        <DropdownItem
                          key={o.value}
                          label={SORT_OPTION_LABELS[o.value]}
                          active={sort === o.value}
                          onClick={() => setSort(o.value)}
                        />
                      ))}
                    </Dropdown>

                    <button
                      type="button"
                      onClick={() => setShowFilters((f) => !f)}
                      aria-expanded={showFilters}
                      className={`flex items-center gap-1.5 min-h-10 px-3 border rounded-lg text-xs font-medium transition-colors ${
                        showFilters || activeFilterCount > 0
                          ? 'border-fuenzer-teal text-fuenzer-teal bg-fuenzer-teal/10'
                          : 'border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-fuenzer-teal text-white text-[9px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    <span className="text-xs font-bold text-slate-gray dark:text-silver-mist uppercase tracking-wider font-sans ml-auto sm:ml-2 whitespace-nowrap">
                      {filtered.length} {t.sourcesCount}
                    </span>
                  </div>
                </div>

                {showFilters && (
                  <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 bg-cloud-canvas/20 dark:bg-stone-gray/10 p-3.5 rounded-xl border border-frost-gray dark:border-stone-gray">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-silver-mist">
                        Index Filter
                      </span>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
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
                            type="button"
                            onClick={() => toggleIndexFilter(f)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              checked
                                ? 'bg-fuenzer-teal text-white border-fuenzer-teal'
                                : 'border-frost-gray dark:border-stone-gray text-slate-gray dark:text-silver-mist hover:border-fuenzer-teal/60 hover:text-fuenzer-teal'
                            }`}
                          >
                            {checked ? (
                              <CheckSquare className="w-3 h-3 shrink-0" aria-hidden="true" />
                            ) : (
                              <Square className="w-3 h-3 shrink-0" aria-hidden="true" />
                            )}
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filtered.length > 0 && (
                  <div className="flex items-center justify-between bg-cloud-canvas/10 dark:bg-stone-gray/5 border border-frost-gray dark:border-stone-gray/60 p-2.5 rounded-xl text-xs font-sans mt-2 select-none animate-in fade-in">
                    <label className="flex items-center gap-2 cursor-pointer min-h-9">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every((s) => selectedDeleteRefs.has(s.id))}
                        onChange={() => {
                          const allSelected = filtered.every((s) => selectedDeleteRefs.has(s.id));
                          setSelectedDeleteRefs((prev) => {
                            const next = new Set(prev);
                            if (allSelected) {
                              filtered.forEach((s) => next.delete(s.id));
                            } else {
                              filtered.forEach((s) => next.add(s.id));
                            }
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded border-cloud-canvas text-fuenzer-teal focus:ring-fuenzer-teal focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="font-semibold text-slate-gray dark:text-silver-mist">
                        {selectedDeleteRefs.size > 0
                          ? language === 'en'
                            ? `${selectedDeleteRefs.size} selected`
                            : `${selectedDeleteRefs.size} terpilih`
                          : language === 'en'
                            ? 'Select All'
                            : 'Pilih Semua'}
                      </span>
                    </label>

                    {selectedDeleteRefs.size > 0 && (
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 min-h-9 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        {language === 'en' ? 'Delete Selected' : 'Hapus Terpilih'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray shadow-sm">
                  {t.noResultsFound}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filtered.map((source) => (
                    <JournalCard
                      key={source.id}
                      source={source}
                      isBookmarked={isBookmarkedInAnyLibrary(source.id)}
                      onToggleBookmark={() => setBookmarkModalSource(source)}
                      isSelected={selectedDeleteRefs.has(source.id)}
                      onToggleSelect={() => toggleDeleteRef(source.id)}
                      citationStyle="APA"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <SaveToLibraryModal
        isOpen={bookmarkModalSource !== null}
        onClose={() => setBookmarkModalSource(null)}
        source={bookmarkModalSource}
      />

      <Footer />
    </div>
  );
}
