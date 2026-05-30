import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, History } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/**
 * UserMenu — Profile dropdown component for the Navbar.
 * Renders avatar (click to toggle dropdown) with menu items and sign out.
 * Only rendered when user is authenticated (non-anonymous).
 */
export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button — toggles dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className={`w-8 h-8 rounded-full border-2 transition-colors ${isOpen ? 'border-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray hover:border-fuenzer-teal'}`}
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

          {/* Logout */}
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
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
