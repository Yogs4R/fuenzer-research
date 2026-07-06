import { useState, useEffect } from 'react';
import { useResearchStore } from '../../store/researchStore';
import { useUiStore } from '../../store/uiStore';
import { X, Plus, FolderPlus, Folder, Check, Lock, Globe } from 'lucide-react';
import type { AcademicSource } from '../../types/research';

interface SaveToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: AcademicSource | null;
}

export function SaveToLibraryModal({ isOpen, onClose, source }: SaveToLibraryModalProps) {
  const { language } = useUiStore();
  const isLanguageId = language === 'id';

  const {
    libraries,
    createFolder,
    toggleBookmarkInLibrary,
    getLibrariesForBookmark,
  } = useResearchStore();

  const [newLibName, setNewLibName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (source && isOpen) {
      setSavedIds(getLibrariesForBookmark(source.id));
    }
  }, [source, isOpen, getLibrariesForBookmark]);

  if (!isOpen || !source) return null;

  const handleCreateLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLibName.trim()) return;

    try {
      await createFolder(newLibName.trim());
      setNewLibName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create library:', err);
    }
  };

  const handleToggle = async (libraryId: string) => {
    const isSaved = savedIds.includes(libraryId);
    if (isSaved) {
      const lib = libraries.find(l => l.id === libraryId);
      const confirmMsg = isLanguageId 
        ? `Apakah Anda yakin ingin menghapus referensi ini dari pustaka "${lib?.name || 'Library'}"?` 
        : `Are you sure you want to remove this reference from library "${lib?.name || 'Library'}"?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    setSavedIds(prev =>
      prev.includes(libraryId)
        ? prev.filter(id => id !== libraryId)
        : [...prev, libraryId]
    );
    await toggleBookmarkInLibrary(libraryId, source);
  };

  // UI Strings Translation fallbacks
  const modalTitle = isLanguageId ? 'Simpan ke Pustaka' : 'Save to Library';
  const saveLabel = isLanguageId ? 'Pilih folder perpustakaan untuk menyimpan artikel ini:' : 'Select library folders to save this article:';
  const newFolderPlaceholder = isLanguageId ? 'Nama perpustakaan baru...' : 'New library name...';
  const createBtnLabel = isLanguageId ? 'Buat' : 'Create';
  const cancelBtnLabel = isLanguageId ? 'Batal' : 'Cancel';
  const addFolderLabel = isLanguageId ? 'Buat Perpustakaan Baru' : 'Create New Library';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-paper-white dark:bg-ink-black rounded-2xl border border-cloud-canvas dark:border-stone-gray shadow-xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-canvas dark:border-stone-gray shrink-0">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-fuenzer-teal" />
            <h3 className="text-sm font-bold text-ink-black dark:text-paper-white font-serif">
              {modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white hover:bg-cloud-canvas/30 dark:hover:bg-stone-gray/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Article Title Snippet */}
          <div className="p-3.5 rounded-xl bg-cloud-canvas/20 dark:bg-stone-gray/10 border border-cloud-canvas/40 dark:border-stone-gray/20">
            <h4 className="text-xs font-bold text-ink-black dark:text-paper-white font-serif line-clamp-2 leading-snug">
              {source.title}
            </h4>
            <p className="text-[10px] text-slate-gray dark:text-silver-mist/70 truncate mt-1">
              {(source.authors || []).slice(0, 2).join(', ')} • {source.year}
            </p>
          </div>

          <p className="text-[11px] font-semibold text-slate-gray dark:text-silver-mist">
            {saveLabel}
          </p>

          {/* Libraries List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {libraries.map((lib) => {
              const isSaved = savedIds.includes(lib.id);
              return (
                <div
                  key={lib.id}
                  onClick={() => handleToggle(lib.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSaved
                      ? 'bg-fuenzer-teal/5 border-fuenzer-teal shadow-xs'
                      : 'bg-cloud-canvas/10 hover:bg-cloud-canvas/30 dark:bg-stone-gray/5 dark:hover:bg-stone-gray/15 border-cloud-canvas/50 dark:border-stone-gray/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder className={`w-4 h-4 shrink-0 ${isSaved ? 'text-fuenzer-teal' : 'text-slate-gray/70'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink-black dark:text-paper-white truncate">
                        {lib.name}
                      </p>
                      <span className="text-[9px] text-slate-gray dark:text-silver-mist/70 flex items-center gap-1 mt-0.5">
                        {lib.isPublic ? (
                          <>
                            <Globe className="w-2.5 h-2.5 text-fuenzer-teal" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5 text-silver-mist" />
                            Private
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isSaved
                        ? 'border-fuenzer-teal bg-fuenzer-teal text-white'
                        : 'border-slate-gray/40 bg-transparent'
                    }`}
                  >
                    {isSaved && <Check className="w-2.5 h-2.5 stroke-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Library Section */}
          <div className="pt-2 border-t border-cloud-canvas/50 dark:border-stone-gray/20 shrink-0">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-cloud-canvas dark:border-stone-gray hover:border-fuenzer-teal dark:hover:border-fuenzer-teal rounded-xl text-[11px] font-bold text-slate-gray dark:text-silver-mist hover:text-fuenzer-teal dark:hover:text-fuenzer-teal hover:bg-fuenzer-teal/5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {addFolderLabel}
              </button>
            ) : (
              <form onSubmit={handleCreateLibrary} className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  placeholder={newFolderPlaceholder}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-cloud-canvas dark:border-stone-gray bg-white dark:bg-ink-black text-ink-black dark:text-paper-white focus:outline-hidden focus:ring-1 focus:ring-fuenzer-teal focus:border-fuenzer-teal font-sans"
                  maxLength={40}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-fuenzer-teal text-white hover:bg-fuenzer-teal-dark transition-colors cursor-pointer"
                >
                  {createBtnLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewLibName('');
                    setIsCreating(false);
                  }}
                  className="px-2.5 py-2 text-xs font-bold rounded-xl border border-cloud-canvas dark:border-stone-gray text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors cursor-pointer"
                >
                  {cancelBtnLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
