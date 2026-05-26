import { X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { en } from '../../locales/en';
import { id } from '../../locales/id';

interface UpdateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateLogModal({ isOpen, onClose }: UpdateLogModalProps) {
  const { language } = useUiStore();
  const t = language === 'en' ? en.updates : id.updates;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Blurred background backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-paper-white dark:bg-ink-black w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-cloud-canvas dark:border-stone-gray animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-ink-black dark:text-cloud-canvas">
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray text-slate-gray transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {t.logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-24 shrink-0 text-xs font-semibold text-fuenzer-teal-dark dark:text-fuenzer-teal pt-1">
                {log.date}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-ink-black dark:text-paper-white mb-1">{log.title}</h3>
                <p className="text-xs text-slate-gray dark:text-silver-mist leading-relaxed">{log.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
