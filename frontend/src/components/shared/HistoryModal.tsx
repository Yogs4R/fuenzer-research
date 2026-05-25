import { X, History } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Blurred background backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-paper-white dark:bg-ink-black w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-cloud-canvas dark:border-stone-gray animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-ink-black dark:text-cloud-canvas flex items-center gap-2">
            <History className="w-5 h-5 text-slate-gray" />
            Recent Prompts
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray text-slate-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-sm font-medium text-ink-black dark:text-paper-white mb-2">No History Yet</p>
          <p className="text-xs text-slate-gray dark:text-silver-mist">Your recent searches and prompts will appear here.</p>
        </div>
      </div>
    </div>
  );
}
