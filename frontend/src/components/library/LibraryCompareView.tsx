import { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  Mic,
  Clock,
  MessageSquare,
  BookOpen,
  Trash2,
  Download,
} from 'lucide-react';
import type { AcademicSource } from '../../types/research';
import { askResearch } from '../../services/api';
import { parseMarkdownTable, exportToCSV } from '../../utils/csvExporter';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { UserMessageCopyButton } from '../shared/UserMessageCopyButton';
import { CopyTextButton } from '../shared/CopyTextButton';
import { MarkdownMessage } from '../shared/MarkdownMessage';
import { en } from '../../locales/en';
import { id } from '../../locales/id';

export interface CompareMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  latencyMs?: number;
  isLoading?: boolean;
  isError?: boolean;
}

interface LibraryCompareViewProps {
  bookmarkedSources: AcademicSource[];
  storageKey: string;
  language: 'en' | 'id';
}

function readCompareHistory(storageKey: string): CompareMessage[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as CompareMessage[]) : [];
  } catch {
    return [];
  }
}

export function LibraryCompareView({
  bookmarkedSources,
  storageKey,
  language,
}: LibraryCompareViewProps) {
  const t = language === 'en' ? en.library : id.library;
  const [selectedCompareRefs, setSelectedCompareRefs] = useState<Set<string>>(new Set());
  const [compareMessages, setCompareMessages] = useState<CompareMessage[]>(() =>
    readCompareHistory(storageKey)
  );
  const [compareInput, setCompareInput] = useState('');
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const compareTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening: isCompareListening, toggleListening: toggleCompareListening } =
    useSpeechRecognition(language, (transcript) => {
      setCompareInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    });

  useEffect(() => {
    if (compareTextareaRef.current) {
      compareTextareaRef.current.style.height = 'auto';
      compareTextareaRef.current.style.height = `${compareTextareaRef.current.scrollHeight}px`;
    }
  }, [compareInput]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compareMessages]);

  const updateCompareMessages = (
    newMsgsOrFn: CompareMessage[] | ((prev: CompareMessage[]) => CompareMessage[])
  ) => {
    setCompareMessages((prev) => {
      const next = typeof newMsgsOrFn === 'function' ? newMsgsOrFn(prev) : newMsgsOrFn;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const handleSendCompare = async (promptText: string) => {
    if (promptText.trim().length < 3 || selectedCompareRefs.size === 0 || isCompareLoading) {
      return;
    }

    setCompareInput('');
    setIsCompareLoading(true);

    const userMsgId = `c-user-${crypto.randomUUID()}`;
    const aiMsgId = `c-ai-${crypto.randomUUID()}`;

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
    } catch {
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

  const quickCompareCards = [
    { title: t.titleMethodology, prompt: t.promptMethodology, desc: t.descMethodology },
    { title: t.titleFindings, prompt: t.promptFindings, desc: t.descFindings },
    { title: t.titleLimitations, prompt: t.promptLimitations, desc: t.descLimitations },
    { title: t.titleMatrix, prompt: t.promptMatrix, desc: t.descMatrix },
  ];

  return (
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto relative font-sans">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-black dark:text-paper-white leading-normal font-serif">
          {t.compareTitle}
        </h2>
        <p className="text-xs text-slate-gray dark:text-silver-mist mt-2 max-w-md mx-auto leading-relaxed">
          {t.compareDesc}
        </p>
      </div>

      {/* Reference selection cards grid */}
      <div className="bg-paper-white dark:bg-ink-black rounded-2xl border border-cloud-canvas dark:border-stone-gray p-4 mb-6 shadow-sm flex flex-col shrink-0">
        <div className="flex justify-between items-center mb-3 select-none">
          <span className="text-[11px] font-bold text-slate-gray dark:text-silver-mist uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-fuenzer-teal" aria-hidden="true" />
            {t.selectSourcesToCompare}
            <span className="px-1.5 py-0.5 rounded bg-fuenzer-teal/10 text-fuenzer-teal font-sans text-[10px] font-bold">
              {selectedCompareRefs.size} / {bookmarkedSources.length}
            </span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (selectedCompareRefs.size === bookmarkedSources.length) {
                setSelectedCompareRefs(new Set());
              } else {
                setSelectedCompareRefs(new Set(bookmarkedSources.map((s) => s.id)));
              }
            }}
            className="min-h-9 px-2 text-xs font-bold text-fuenzer-teal hover:text-fuenzer-teal-dark hover:underline cursor-pointer"
          >
            {selectedCompareRefs.size === bookmarkedSources.length ? t.clearSelection : t.selectAll}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-44 overflow-y-auto pr-1">
          {bookmarkedSources.map((source) => {
            const isChecked = selectedCompareRefs.has(source.id);
            return (
              <button
                key={source.id}
                type="button"
                aria-pressed={isChecked}
                onClick={() => {
                  setSelectedCompareRefs((prev) => {
                    const next = new Set(prev);
                    if (next.has(source.id)) next.delete(source.id);
                    else next.add(source.id);
                    return next;
                  });
                }}
                className={`p-3 min-h-11 rounded-xl border transition-all duration-200 cursor-pointer select-none flex gap-2.5 items-start text-left ${
                  isChecked
                    ? 'bg-fuenzer-teal/5 border-fuenzer-teal ring-1 ring-fuenzer-teal/20'
                    : 'bg-cloud-canvas/30 hover:bg-cloud-canvas/60 dark:bg-stone-gray/10 dark:hover:bg-stone-gray/25 border-cloud-canvas dark:border-stone-gray'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-3.5 h-3.5 mt-0.5 rounded border shrink-0 flex items-center justify-center ${
                    isChecked
                      ? 'bg-fuenzer-teal border-fuenzer-teal text-white'
                      : 'border-frost-gray dark:border-stone-gray bg-paper-white dark:bg-ink-black'
                  }`}
                >
                  {isChecked && <span className="w-1.5 h-1.5 bg-white rounded-xs" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink-black dark:text-paper-white truncate font-serif leading-snug">
                    {source.title}
                  </p>
                  <p className="text-[10px] text-slate-gray dark:text-silver-mist/70 truncate mt-1">
                    {(source.authors || []).slice(0, 2).join(', ')} • {source.year}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Timeline / Messages */}
      <div className="flex-1 min-h-[300px] border border-cloud-canvas dark:border-stone-gray/60 bg-cloud-canvas/10 dark:bg-[#121212]/30 rounded-2xl p-5 overflow-y-auto flex flex-col gap-6 mb-36 shadow-inner">
        {compareMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-8">
            <div className="flex flex-col items-center gap-2 select-none">
              <MessageSquare className="w-10 h-10 text-slate-gray/60 dark:text-stone-gray" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm font-semibold text-silver-mist">{t.askEmptyPlaceholder}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-3xl px-2">
              {quickCompareCards.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendCompare(card.prompt)}
                  disabled={selectedCompareRefs.size === 0 || isCompareLoading}
                  className="p-4 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black hover:border-fuenzer-teal hover:shadow-md text-left transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-cloud-canvas select-none"
                >
                  <h3 className="text-xs font-bold text-ink-black dark:text-paper-white group-hover:text-fuenzer-teal transition-colors">
                    {card.title}
                  </h3>
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
                <div className="flex flex-col items-end max-w-[85%]">
                  <div className="bg-fuenzer-teal text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs leading-relaxed shadow-sm wrap-break-word select-text font-sans w-full">
                    {msg.content}
                  </div>
                  <UserMessageCopyButton text={msg.content} />
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col gap-1 w-full max-w-[92%] select-text animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 mb-0.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-fuenzer-teal shrink-0" aria-hidden="true" />
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
                    <MarkdownMessage content={msg.content} />
                  </div>

                  <div className="flex items-center justify-between px-1 text-[10px] text-slate-gray/70 dark:text-silver-mist/50 font-sans select-none">
                    <div className="flex items-center gap-1 font-medium text-[9px] uppercase tracking-wider dark:text-slate-400">
                      <Clock className="w-2.5 h-2.5 text-silver-mist shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      <span>{msg.latencyMs ? (msg.latencyMs / 1000).toFixed(1) : '0.0'}s</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const parsedTable = msg.content.includes('|') ? parseMarkdownTable(msg.content) : [];
                        if (parsedTable.length <= 1) return null;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const headers = parsedTable[0];
                              const rows = parsedTable.slice(1);
                              exportToCSV(headers, rows, `literature_matrix_${new Date().toISOString().slice(0, 10)}.csv`);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white text-[10px] font-bold transition-all cursor-pointer shadow-xs select-none"
                            title="Export matrix table to CSV/Excel"
                          >
                            <Download className="w-3.5 h-3.5 text-silver-mist" aria-hidden="true" />
                            {t.exportCSV}
                          </button>
                        );
                      })()}
                      <CopyTextButton text={msg.content} label={language === 'en' ? 'Copy answer' : 'Salin jawaban'} />
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
      <div className="sticky bottom-4 left-0 right-0 w-full max-w-3xl px-2 shrink-0 select-none">
        {selectedCompareRefs.size === 0 && (
          <div className="mb-2 text-center text-[10px] text-red-600 dark:text-red-400 font-bold">
            {t.selectRefsToAsk}
          </div>
        )}
        {selectedCompareRefs.size > 0 && (
          <>
            <div className="mb-2 px-2 flex justify-between items-center text-[10px] text-slate-gray dark:text-silver-mist font-semibold">
              <span>
                {selectedCompareRefs.size} {t.sourcesSelectedForAnalysis}
              </span>
              {compareMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmMsg =
                      language === 'en'
                        ? 'Are you sure you want to clear the conversation history?'
                        : 'Apakah Anda yakin ingin menghapus riwayat percakapan?';
                    if (window.confirm(confirmMsg)) {
                      updateCompareMessages([]);
                    }
                  }}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline cursor-pointer font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.clearConversation}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 select-none max-w-full no-scrollbar">
              {quickCompareCards.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendCompare(card.prompt)}
                  disabled={isCompareLoading}
                  className="px-3.5 py-2 min-h-9 rounded-full text-[10px] font-bold border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black text-slate-gray hover:text-fuenzer-teal dark:text-silver-mist dark:hover:text-paper-white hover:border-fuenzer-teal transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-xs"
                  title={card.prompt}
                >
                  {card.title}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-2xl p-2 flex flex-col w-full relative">
          <textarea
            ref={compareTextareaRef}
            placeholder={
              selectedCompareRefs.size === 0 ? t.placeholderRefsLocked : t.placeholderRefsUnlocked
            }
            aria-label={language === 'en' ? 'Compare references prompt' : 'Pertanyaan perbandingan referensi'}
            className="w-full min-h-[60px] max-h-[200px] resize-none px-3 py-2 bg-transparent text-xs outline-none text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray overflow-y-auto"
            value={compareInput}
            onChange={(e) => setCompareInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendCompare(compareInput);
              }
            }}
            disabled={selectedCompareRefs.size === 0 || isCompareLoading}
            rows={1}
          />

          <div className="flex items-center justify-end gap-2 mt-1 pt-1 px-1">
            <button
              type="button"
              title={language === 'en' ? 'Voice Input' : 'Input Suara'}
              aria-label={language === 'en' ? 'Voice Input' : 'Input Suara'}
              onClick={toggleCompareListening}
              disabled={selectedCompareRefs.size === 0 || isCompareLoading}
              className={`min-h-10 min-w-10 flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isCompareListening
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-slate-gray hover:text-fuenzer-teal hover:bg-cloud-canvas/50 dark:text-silver-mist dark:hover:bg-stone-gray/50'
              }`}
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={language === 'en' ? 'Send compare question' : 'Kirim pertanyaan perbandingan'}
              onClick={() => handleSendCompare(compareInput)}
              disabled={
                compareInput.trim().length < 3 || selectedCompareRefs.size === 0 || isCompareLoading
              }
              className="w-10 h-10 shrink-0 rounded-full bg-fuenzer-teal text-white flex items-center justify-center hover:bg-fuenzer-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
