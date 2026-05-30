import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
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
  Send,
  Copy,
  Check,
  Clock,
  MessageSquare,
  BookOpen,
  Trash2,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { askResearch } from '../services/api';

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      }}
      className="p-1.5 rounded-lg hover:bg-cloud-canvas dark:hover:bg-stone-gray/50 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-all cursor-pointer"
      title="Copy answer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
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

  const { user } = useAuthStore();
  const storageKey = user
    ? (user.isAnonymous ? 'fuenzer_library_compare_chat_guest' : `fuenzer_library_compare_chat_${user.uid}`)
    : 'fuenzer_library_compare_chat_guest';

  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');
  const [selectedCompareRefs, setSelectedCompareRefs] = useState<Set<string>>(new Set());
  const [compareMessages, setCompareMessages] = useState<any[]>([]);
  const [compareInput, setCompareInput] = useState('');
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages on mount/user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setCompareMessages(JSON.parse(stored));
      } else {
        setCompareMessages([]);
      }
    } catch {
      setCompareMessages([]);
    }
  }, [storageKey]);

  // Synchronized state & localStorage updater
  const updateCompareMessages = (newMsgsOrFn: any[] | ((prev: any[]) => any[])) => {
    setCompareMessages((prev) => {
      const next = typeof newMsgsOrFn === 'function' ? newMsgsOrFn(prev) : newMsgsOrFn;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Auto scroll compare chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compareMessages]);

  const handleSendCompare = async (promptText: string) => {
    if (promptText.trim().length < 3) return;
    if (selectedCompareRefs.size === 0) return;
    if (isCompareLoading) return;

    setCompareInput('');
    setIsCompareLoading(true);

    const userMsgId = `c-user-${Date.now()}`;
    const aiMsgId = `c-ai-${Date.now()}`;

    // Add user message & loading AI message immediately
    updateCompareMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: promptText.trim() },
      { id: aiMsgId, role: 'ai', content: '', isLoading: true },
    ]);

    try {
      const sourcesToCompare = bookmarkedSources.filter((s) => selectedCompareRefs.has(s.id));
      const response = await askResearch(promptText.trim(), sourcesToCompare);

      updateCompareMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: response.answer,
                latencyMs: response.latency_ms,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (err) {
      updateCompareMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                content: t.failedCompare,
                isError: true,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsCompareLoading(false);
    }
  };

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

          {/* View Toggle + Search Bar */}
          {bookmarkedSources.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 font-sans">
              {/* Segmented Control */}
              <div className="flex bg-cloud-canvas/60 dark:bg-stone-gray/40 rounded-lg p-0.5 border border-cloud-canvas dark:border-stone-gray select-none w-fit shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  {t.tabMyLibrary}
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'compare'
                      ? 'bg-fuenzer-teal/10 text-fuenzer-teal shadow-sm border border-fuenzer-teal/30'
                      : 'text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-fuenzer-teal shrink-0" />
                  {t.tabAiCompare}
                </button>
              </div>

              {viewMode === 'list' && (
                <div className="flex items-center border border-cloud-canvas dark:border-stone-gray rounded-xl px-4 h-12 hover:border-silver-mist focus-within:border-fuenzer-teal bg-cloud-canvas/30 dark:bg-stone-gray/30 transition-colors w-full md:w-64 font-sans">
                  <Search className="w-4 h-4 text-silver-mist shrink-0 mr-2.5" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
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
        ) : viewMode === 'compare' ? (
          /* AI Compare Q&A centered layout */
          <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto relative font-sans">
            {/* Center Hero title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-fuenzer-teal via-code-blue to-purple-600 bg-clip-text text-transparent leading-normal font-serif select-none">
                {t.compareTitle}
              </h2>
              <p className="text-xs text-slate-gray dark:text-silver-mist mt-2 max-w-md mx-auto leading-relaxed select-none">
                {t.compareDesc}
              </p>
            </div>

            {/* Reference selection cards grid */}
            <div className="bg-paper-white dark:bg-ink-black rounded-2xl border border-cloud-canvas dark:border-stone-gray p-4 mb-6 shadow-sm flex flex-col shrink-0">
              <div className="flex justify-between items-center mb-3 select-none">
                <span className="text-[11px] font-bold text-slate-gray dark:text-silver-mist uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-fuenzer-teal" />
                  {t.selectSourcesToCompare}
                  <span className="px-1.5 py-0.5 rounded bg-fuenzer-teal/10 text-fuenzer-teal font-sans text-[10px] font-bold">
                    {selectedCompareRefs.size} / {bookmarkedSources.length}
                  </span>
                </span>
                <button
                  onClick={() => {
                    if (selectedCompareRefs.size === bookmarkedSources.length) {
                      setSelectedCompareRefs(new Set());
                    } else {
                      setSelectedCompareRefs(new Set(bookmarkedSources.map((s) => s.id)));
                    }
                  }}
                  className="text-xs font-bold text-fuenzer-teal hover:text-fuenzer-teal-dark hover:underline cursor-pointer"
                >
                  {selectedCompareRefs.size === bookmarkedSources.length
                    ? t.clearSelection
                    : t.selectAll}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto pr-1">
                {bookmarkedSources.map((source) => {
                  const isChecked = selectedCompareRefs.has(source.id);
                  return (
                    <div
                      key={source.id}
                      onClick={() => {
                        setSelectedCompareRefs((prev) => {
                          const next = new Set(prev);
                          if (next.has(source.id)) next.delete(source.id);
                          else next.add(source.id);
                          return next;
                        });
                      }}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none flex gap-2.5 items-start ${
                        isChecked
                          ? 'bg-fuenzer-teal/5 border-fuenzer-teal ring-1 ring-fuenzer-teal/20'
                          : 'bg-cloud-canvas/30 hover:bg-cloud-canvas/60 dark:bg-stone-gray/10 dark:hover:bg-stone-gray/25 border-cloud-canvas dark:border-stone-gray'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 mt-0.5 rounded border-cloud-canvas text-fuenzer-teal focus:ring-fuenzer-teal focus:ring-offset-0 pointer-events-none"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink-black dark:text-paper-white truncate font-serif leading-snug">
                          {source.title}
                        </p>
                        <p className="text-[10px] text-slate-gray dark:text-silver-mist/70 truncate mt-1">
                          {(source.authors || []).slice(0, 2).join(', ')} • {source.year}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Timeline / Messages */}
            <div className="flex-1 min-h-[300px] border border-cloud-canvas dark:border-stone-gray/60 bg-cloud-canvas/10 dark:bg-[#121212]/30 rounded-2xl p-5 overflow-y-auto flex flex-col gap-6 mb-28 shadow-inner">
              {compareMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-8">
                  <div className="flex flex-col items-center gap-2 select-none">
                    <MessageSquare className="w-10 h-10 text-slate-gray/60 dark:text-stone-gray animate-bounce" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-silver-mist">
                      {t.askEmptyPlaceholder}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl px-2">
                    {[
                      {
                        title: t.titleMethodology,
                        prompt: t.promptMethodology,
                        desc: t.descMethodology,
                      },
                      {
                        title: t.titleFindings,
                        prompt: t.promptFindings,
                        desc: t.descFindings,
                      },
                      {
                        title: t.titleLimitations,
                        prompt: t.promptLimitations,
                        desc: t.descLimitations,
                      },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendCompare(card.prompt)}
                        disabled={selectedCompareRefs.size === 0 || isCompareLoading}
                        className="p-4 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black hover:border-fuenzer-teal hover:shadow-md text-left transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-cloud-canvas select-none"
                      >
                        <h4 className="text-xs font-bold text-ink-black dark:text-paper-white group-hover:text-fuenzer-teal transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-[10px] text-slate-gray dark:text-silver-mist mt-1 leading-relaxed">
                          {card.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {compareMessages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-fuenzer-teal text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs leading-relaxed shadow-sm wrap-break-word select-text font-sans">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex flex-col gap-1 w-full max-w-[92%] select-text animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 mb-0.5 select-none">
                      <Sparkles className="w-3 h-3 text-fuenzer-teal shrink-0 animate-pulse" />
                      <span className="text-[9px] font-bold text-fuenzer-teal tracking-wide uppercase">Fuenzer AI</span>
                    </div>

                    {msg.isLoading ? (
                      <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas/50 dark:border-stone-gray/30 rounded-2xl rounded-tl-sm p-4 w-full shadow-sm">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3.5 bg-cloud-canvas dark:bg-stone-gray rounded w-3/4" />
                          <div className="h-3.5 bg-cloud-canvas dark:bg-stone-gray rounded w-5/6" />
                          <div className="h-3.5 bg-cloud-canvas dark:bg-stone-gray rounded w-2/3" />
                        </div>
                      </div>
                    ) : msg.isError ? (
                      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs border-l-4 border-red-500 leading-relaxed font-sans shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 w-full animate-in fade-in duration-350">
                        <div className="bg-paper-white dark:bg-ink-black rounded-2xl rounded-tl-sm p-4 shadow-sm border border-cloud-canvas/50 dark:border-stone-gray/30">
                          <div
                            className="prose prose-xs prose-slate dark:prose-invert max-w-none text-ink-black dark:text-slate-100 leading-relaxed text-xs [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>ul>li]:mb-1 [&>ol>li]:mb-1"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                marked.parse(msg.content, { async: false }) as string
                              ),
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between px-1 text-[10px] text-slate-gray/70 dark:text-silver-mist/50 font-sans select-none">
                          <div className="flex items-center gap-1 font-medium text-[9px] uppercase tracking-wider dark:text-slate-400">
                            <Clock className="w-2.5 h-2.5 text-silver-mist shrink-0" strokeWidth={2.5} />
                            <span>{msg.latencyMs ? (msg.latencyMs / 1000).toFixed(1) : '0.0'}s</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <CopyButton text={msg.content} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom floating pill input bar */}
            <div className="absolute bottom-4 left-0 right-0 w-full max-w-3xl px-2 shrink-0 select-none">
              {selectedCompareRefs.size === 0 && (
                <div className="mb-2 text-center text-[10px] text-red-500 font-bold animate-pulse">
                  {t.selectRefsToAsk}
                </div>
              )}
              {selectedCompareRefs.size > 0 && (
                <div className="mb-2 px-2 flex justify-between items-center text-[10px] text-slate-gray dark:text-silver-mist font-semibold">
                  <span>
                    {selectedCompareRefs.size} {t.sourcesSelectedForAnalysis}
                  </span>
                  {compareMessages.length > 0 && (
                    <button
                      onClick={() => updateCompareMessages([])}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline cursor-pointer font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.clearConversation}
                    </button>
                  )}
                </div>
              )}
              <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-full p-2 pl-4 flex items-center gap-2 focus-within:ring-2 focus-within:ring-fuenzer-teal/20 transition-all">
                <input
                  type="text"
                  placeholder={
                    selectedCompareRefs.size === 0
                      ? t.placeholderRefsLocked
                      : t.placeholderRefsUnlocked
                  }
                  className="flex-1 min-w-0 bg-transparent text-xs outline-none text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray h-9 animate-none"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCompare(compareInput)}
                  disabled={selectedCompareRefs.size === 0 || isCompareLoading}
                />
                <button
                  onClick={() => handleSendCompare(compareInput)}
                  disabled={compareInput.trim().length < 3 || selectedCompareRefs.size === 0 || isCompareLoading}
                  className="w-9 h-9 shrink-0 rounded-full bg-fuenzer-teal text-white flex items-center justify-center hover:bg-fuenzer-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
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
                    {filtered.length} {t.sourcesCount}
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
                {t.noResultsFound}
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
