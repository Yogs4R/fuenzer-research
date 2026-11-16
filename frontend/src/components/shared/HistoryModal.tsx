import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Trash2, Clock } from 'lucide-react';
import { useResearchStore, getCurrentHistoryKey } from '../../store/researchStore';
import { useUiStore } from '../../store/uiStore';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { en } from '../../locales/en';
import { id } from '../../locales/id';

interface HistoryEntry {
  id: string;
  query: string;
  title: string;
  timestamp: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function readStoredHistory(): HistoryEntry[] {
  const historyKey = getCurrentHistoryKey();
  const stored = localStorage.getItem(historyKey);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      const now = Date.now();
      const migrated: HistoryEntry[] = parsed.map((q: string, i: number) => ({
        id: `legacy-${i}`,
        query: q,
        title: q,
        timestamp: now - i * 60000,
      }));
      localStorage.setItem(historyKey, JSON.stringify(migrated));
      return migrated;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  useEscapeKey(isOpen, onClose);
  if (!isOpen) return null;
  return <HistoryModalContent onClose={onClose} />;
}

function HistoryModalContent({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<HistoryEntry[]>(readStoredHistory);
  const [now, setNow] = useState(() => Date.now());
  const navigate = useNavigate();
  const { loadSession, deleteSession, clearHistory } = useResearchStore();
  const { language } = useUiStore();
  const t = language === 'en' ? en.nav : id.nav;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (entry: HistoryEntry) => {
    const historyKey = getCurrentHistoryKey();
    const stored = localStorage.getItem(historyKey);
    const h: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = [entry, ...h.filter((x) => x.id !== entry.id)].slice(0, 20);
    localStorage.setItem(historyKey, JSON.stringify(updated));

    loadSession(entry.id);
    onClose();
    navigate('/playground');
  };

  const handleDelete = (itemId: string) => {
    deleteSession(itemId);
    setHistory((prev) => prev.filter((h) => h.id !== itemId));
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  const formatTime = (ts: number) => {
    const diff = now - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-paper-white dark:bg-ink-black w-full max-w-sm mx-4 rounded-2xl shadow-2xl border border-cloud-canvas dark:border-stone-gray animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-cloud-canvas dark:border-stone-gray">
          <h2 id="history-modal-title" className="text-lg font-bold text-ink-black dark:text-cloud-canvas flex items-center gap-2 font-serif">
            <History className="w-5 h-5 text-fuenzer-teal" aria-hidden="true" />
            {t.recentSearches}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={language === 'en' ? 'Close history' : 'Tutup riwayat'}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray text-slate-gray transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Clock className="w-10 h-10 text-cloud-canvas dark:text-stone-gray mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm font-medium text-ink-black dark:text-paper-white mb-1">{t.noHistoryYet}</p>
              <p className="text-xs text-slate-gray dark:text-silver-mist">{t.noHistoryDesc}</p>
            </div>
          ) : (
            <div className="py-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-1 hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex-1 flex items-start gap-3 px-2 py-2.5 text-left min-w-0"
                  >
                    <Clock className="w-4 h-4 text-silver-mist shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink-black dark:text-cloud-canvas truncate font-medium">{item.title}</p>
                      {item.title !== item.query && (
                        <p className="text-xs text-silver-mist truncate">{item.query}</p>
                      )}
                      <p className="text-[10px] text-silver-mist mt-0.5">{formatTime(item.timestamp)}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="min-h-11 min-w-11 flex items-center justify-center rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-silver-mist hover:text-red-500 transition-all shrink-0 ml-1"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-cloud-canvas dark:border-stone-gray">
            <button
              type="button"
              onClick={handleClearAll}
              className="w-full min-h-11 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg transition-colors"
            >
              {t.clearAllHistory}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
