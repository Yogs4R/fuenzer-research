import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Trash2, Clock } from 'lucide-react';
import { useResearchStore, getCurrentHistoryKey } from '../../store/researchStore';
import { useUiStore } from '../../store/uiStore';
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

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();
  const { loadSession, currentSessionId, reset } = useResearchStore();
  const { language } = useUiStore();
  const t = language === 'en' ? en.nav : id.nav;

  useEffect(() => {
    if (isOpen) {
      const historyKey = getCurrentHistoryKey();
      const stored = localStorage.getItem(historyKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Support both old (string[]) and new (HistoryEntry[]) format
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            const migrated: HistoryEntry[] = parsed.map((q: string, i: number) => ({
              id: `legacy-${i}`,
              query: q,
              title: q,
              timestamp: Date.now() - i * 60000,
              messages: [],
              response: null,
              scope: 'global',
              searchType: 'All',
              searchLocation: 'Global',
              searchAccreditation: 'Any',
              sintaRank: ['All']
            }));
            localStorage.setItem(historyKey, JSON.stringify(migrated));
            setHistory(migrated);
          } else {
            setHistory(parsed);
          }
        } catch {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    }
  }, [isOpen]);

  const handleSelect = async (entry: HistoryEntry) => {
    const historyKey = getCurrentHistoryKey();
    // Move selected to top of history
    const stored = localStorage.getItem(historyKey);
    const h: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    const updated = [entry, ...h.filter((x) => x.id !== entry.id)].slice(0, 20);
    localStorage.setItem(historyKey, JSON.stringify(updated));
    
    // Load full session state
    loadSession(entry.id);
    onClose();
    navigate('/playground');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const historyKey = getCurrentHistoryKey();
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(historyKey, JSON.stringify(updated));
    setHistory(updated);
    if (currentSessionId === id) {
      reset();
    }
  };

  const handleClearAll = () => {
    const historyKey = getCurrentHistoryKey();
    localStorage.removeItem(historyKey);
    setHistory([]);
    reset();
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-paper-white dark:bg-ink-black w-full max-w-sm mx-4 rounded-2xl shadow-2xl border border-cloud-canvas dark:border-stone-gray animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-cloud-canvas dark:border-stone-gray">
          <h2 className="text-lg font-bold text-ink-black dark:text-cloud-canvas flex items-center gap-2 font-serif">
            <History className="w-5 h-5 text-fuenzer-teal" />
            {t.recentSearches}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray text-slate-gray transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Clock className="w-10 h-10 text-cloud-canvas dark:text-stone-gray mx-auto mb-3" />
              <p className="text-sm font-medium text-ink-black dark:text-paper-white mb-1">{t.noHistoryYet}</p>
              <p className="text-xs text-slate-gray dark:text-silver-mist">{t.noHistoryDesc}</p>
            </div>
          ) : (
            <div className="py-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Clock className="w-4 h-4 text-silver-mist shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-ink-black dark:text-cloud-canvas truncate font-medium">{item.title}</p>
                      {item.title !== item.query && (
                        <p className="text-xs text-silver-mist truncate">{item.query}</p>
                      )}
                      <p className="text-[10px] text-silver-mist mt-0.5">{formatTime(item.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-silver-mist hover:text-red-500 transition-all shrink-0 ml-2"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-cloud-canvas dark:border-stone-gray">
            <button
              onClick={handleClearAll}
              className="w-full text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 px-4 rounded-lg transition-colors"
            >
              {t.clearAllHistory}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
