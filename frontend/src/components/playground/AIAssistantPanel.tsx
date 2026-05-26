import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useResearchStore } from '../../store/researchStore';
import type { ChatMessage } from '../../store/researchStore';
import { NarrativeSkeletonLoader } from '../shared/NarrativeSkeletonLoader';
import {
  ArrowRight,
  Clock,
  Edit2,
  ExternalLink,
  MoreVertical,
  Sparkles,
  X,
} from 'lucide-react';
import { marked } from 'marked';

const HISTORY_KEY = 'fuenzer_search_history';

interface HistoryEntry {
  id: string;
  query: string;
  title: string;
  timestamp: number;
}

interface AIAssistantPanelProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

function AIChatBubble({ message }: { message: ChatMessage }) {
  const isLoading =
    message.phase === 'searching' ||
    message.phase === 'filtering' ||
    message.phase === 'synthesizing';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Sparkles className="w-3 h-3 text-fuenzer-teal shrink-0" />
        <span className="text-[9px] font-bold text-fuenzer-teal tracking-wide uppercase">Fuenzer AI</span>
      </div>
      {isLoading && <NarrativeSkeletonLoader phase={message.phase} />}
      {message.phase === 'error' && (
        <div className="p-3 rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs border-l-4 border-red-500 leading-relaxed">
          {message.error || 'Terjadi kesalahan. Silakan coba lagi.'}
        </div>
      )}
      {message.phase === 'complete' && message.response && (
        <div className="bg-cloud-canvas dark:bg-stone-gray/60 rounded-2xl rounded-tl-sm p-3 max-h-48 overflow-y-auto shadow-sm border border-cloud-canvas/50 dark:border-stone-gray/30">
          <div
            className="prose prose-xs prose-slate max-w-none text-ink-black dark:text-silver-mist leading-relaxed text-xs [&>p]:mb-2 [&>ul]:mt-1 [&>ul]:mb-2 [&>ol]:mt-1 [&>ol]:mb-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                marked.parse(message.response.synthesis, { async: false }) as string
              ),
            }}
          />
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-slate-gray/70 dark:text-silver-mist/70 pt-2 mt-2 border-t border-cloud-canvas/80 dark:border-stone-gray/50">
            <Clock className="w-2.5 h-2.5" strokeWidth={2} />
            {(message.response.latency_ms / 1000).toFixed(1)}s
          </div>
        </div>
      )}
    </div>
  );
}

export function AIAssistantPanel({ isSidebarOpen, setIsSidebarOpen }: AIAssistantPanelProps) {
  const [inputVal, setInputVal] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Use a ref on the chat container for scrolling — avoids hijacking the page scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    messages,
    setQuery,
    executeSearch,
    clearMessages,
  } = useResearchStore();

  const [sessionTitle, setSessionTitle] = useState(query || 'New Topic');
  // Track the history id for the current session so we can update its title later
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  // On mount, find the matching history entry (by query) and store its id
  useEffect(() => {
    if (!query) return;
    const stored = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const found = history.find((h) => h.query === query);
    if (found) setCurrentHistoryId(found.id);
  }, [query]);

  // Auto-scroll chat container (NOT the window) on new messages
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      // Use requestAnimationFrame so layout is complete before scrolling
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When session title is committed, update the history entry in localStorage
  const commitTitle = (newTitle: string) => {
    setIsEditingTitle(false);
    setSessionTitle(newTitle);
    if (!currentHistoryId) return;
    const stored = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = history.map((h) =>
      h.id === currentHistoryId ? { ...h, title: newTitle } : h
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (inputVal.trim().length < 3) return;
    setQuery(inputVal.trim());
    setInputVal('');
    await executeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isAnythingLoading = messages.some(
    (m) => m.role === 'ai' && (m.phase === 'searching' || m.phase === 'filtering' || m.phase === 'synthesizing')
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Panel: AI Assistant */}
      <section
        className={`${
          isSidebarOpen
            ? 'fixed inset-0 h-dvh w-full z-50 md:relative md:h-auto md:w-[25%] md:z-auto flex animate-in slide-in-from-bottom-full md:animate-none'
            : 'hidden md:hidden'
        } flex-col bg-paper-white dark:bg-ink-black transition-colors shrink-0`}
      >
        {/* Header: Title + X button */}
        <div className="px-6 py-4 border-b border-cloud-canvas dark:border-stone-gray flex justify-between items-center shrink-0">
          <div className="w-full pr-8 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                onBlur={() => commitTitle(sessionTitle)}
                onKeyDown={(e) => e.key === 'Enter' && commitTitle(sessionTitle)}
                className="text-sm font-bold bg-transparent border-b border-fuenzer-teal outline-none text-ink-black dark:text-cloud-canvas font-serif w-full"
              />
            ) : (
              <h2
                className="text-sm font-bold text-ink-black dark:text-cloud-canvas flex items-center gap-2 font-serif cursor-pointer group truncate"
                onClick={() => setIsEditingTitle(true)}
              >
                <span className="truncate">{sessionTitle.length > 28 ? sessionTitle.substring(0, 28) + '...' : sessionTitle}</span>
                <Edit2 className="w-3 h-3 text-silver-mist group-hover:text-ink-black dark:group-hover:text-paper-white transition-colors shrink-0" />
              </h2>
            )}
          </div>
          <button
            className="md:hidden text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white shrink-0"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header: AI Assistant title + ⋮ menu */}
        <div className="px-6 py-3 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-ink-black dark:text-paper-white font-serif">AI Assistant</h1>
          <div className="relative" ref={menuRef}>
            <MoreVertical
              className="w-5 h-5 text-slate-gray cursor-pointer dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            {isMenuOpen && (
              <div className="absolute top-8 right-0 w-52 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Open a new browser tab/window with a fresh session at landing page
                    window.open('/', '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-silver-mist" />
                  New Window
                </button>
                <div className="border-t border-cloud-canvas dark:border-stone-gray my-1" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    clearMessages();
                    setSessionTitle('New Topic');
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Clear Conversation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Area — ref-based scroll, NOT scrollIntoView */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-5"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
              <Sparkles className="w-8 h-8 text-cloud-canvas dark:text-stone-gray" />
              <p className="text-sm text-silver-mist font-medium">Ask Fuenzer AI anything about this topic.</p>
            </div>
          )}

          {messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-fuenzer-teal text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed shadow-sm">
                    {message.query}
                  </div>
                </div>
              );
            }
            return (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-[92%]">
                  <AIChatBubble message={message} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="px-5 pb-5 pt-3 shrink-0 border-t border-cloud-canvas dark:border-stone-gray">
          <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-lg rounded-xl p-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Fuenzer AI or prompt a specific analysis..."
              className="flex-1 min-w-0 h-10 px-3 bg-transparent text-sm outline-none text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              disabled={inputVal.trim().length < 3 || isAnythingLoading}
              className="w-8 h-8 shrink-0 rounded-full bg-fuenzer-teal text-white flex items-center justify-center hover:bg-fuenzer-teal-dark disabled:opacity-50 transition-colors"
            >
              <ArrowRight className="w-4 h-4 -rotate-90" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
