import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, History, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { en } from '../../locales/en';
import { id } from '../../locales/id';

/**
 * UserMenu — Profile dropdown component for the Navbar.
 * Renders avatar (click to toggle dropdown) with menu items and sign out.
 * Only rendered when user is authenticated (non-anonymous).
 */
export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuthStore();
  const { language } = useUiStore();
  const t = language === 'en' ? en : id;

  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || user.isAnonymous) return null;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      setShowConfirmDelete(false);
      navigate('/');
    } catch (err: any) {
      const translatedError = useAuthStore.getState().error || (language === 'en' ? "Failed to delete account." : "Gagal menghapus akun.");
      setDeleteError(translatedError);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Avatar Button — toggles dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center justify-center focus:outline-none"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className={`w-8 h-8 rounded-full border-2 transition-colors object-cover ${isOpen ? 'border-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray hover:border-fuenzer-teal'}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full bg-fuenzer-teal/10 border-2 flex items-center justify-center transition-colors ${isOpen ? 'border-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray hover:border-fuenzer-teal'}`}>
            <User className="w-4 h-4 text-fuenzer-teal" />
          </div>
        )}
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl overflow-hidden animate-in fade-in z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-cloud-canvas dark:border-stone-gray">
            <p className="text-sm font-bold text-ink-black dark:text-paper-white truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-[11px] text-slate-gray dark:text-silver-mist truncate">
              {user.email || 'Anonymous account'}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); navigate('/library'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors text-left"
            >
              <User className="w-4 h-4 text-silver-mist" />
              My Library
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/citations'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors text-left"
            >
              <History className="w-4 h-4 text-silver-mist" />
              Citations
            </button>
          </div>

          {/* Action Footer (Sign Out & Delete) */}
          <div className="border-t border-cloud-canvas dark:border-stone-gray py-1">
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              {t.auth.logout}
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowConfirmDelete(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500/80 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left font-semibold"
            >
              <Trash2 className="w-4 h-4 text-red-500/80 dark:text-red-400/80" />
              {t.auth.deleteAccount}
            </button>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 animate-in fade-in duration-200">
          <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-black dark:text-paper-white mb-2 font-sans">
                {t.auth.deleteAccountTitle}
              </h3>
              <p className="text-xs text-slate-gray dark:text-silver-mist mb-6 font-sans">
                {t.auth.deleteAccountDesc}
              </p>

              {deleteError && (
                <div className="w-full mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans text-left">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setDeleteError(null);
                  }}
                  className="flex-1 h-10 rounded-xl border border-cloud-canvas dark:border-stone-gray text-slate-gray dark:text-silver-mist text-sm font-semibold hover:bg-cloud-canvas/30 dark:hover:bg-stone-gray/10 transition-colors cursor-pointer font-sans"
                >
                  {t.auth.cancel}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t.auth.delete
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
