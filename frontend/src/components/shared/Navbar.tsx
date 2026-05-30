import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Bell, History, Globe, Menu, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useResearchStore } from '../../store/researchStore';
import { useAuthStore } from '../../store/authStore';
import { en } from '../../locales/en';
import { id } from '../../locales/id';
import { UpdateLogModal } from './UpdateLogModal';
import { HistoryModal } from './HistoryModal';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  mode?: 'landing' | 'playground';
}

export function Navbar({ mode = 'landing' }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, language, toggleLanguage } = useUiStore();
  const t = language === 'en' ? en.nav : id.nav;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentHistory, setRecentHistory] = useState<Array<{id: string; query: string; title: string; timestamp: number}>>([]);
  const { loadSession } = useResearchStore();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage when dropdown opens
  useEffect(() => {
    if (isHistoryOpen) {
      const stored = localStorage.getItem('fuenzer_search_history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Support both old (string[]) and new (HistoryEntry[]) format
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            setRecentHistory(parsed.map((q: string) => ({ id: q, query: q, title: q, timestamp: Date.now() })));
          } else {
            setRecentHistory(parsed);
          }
        } catch {
          setRecentHistory([]);
        }
      } else {
        setRecentHistory([]);
      }
    }
  }, [isHistoryOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinksLanding = [
    { key: 'about', label: t.about },
    { key: 'features', label: t.features },
    { key: 'workflow', label: t.workflow },
    { key: 'faq', label: t.faq },
  ];

  const navLinksPlayground = [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'library', label: t.library, path: '/library' },
    { key: 'citations', label: t.citations, path: '/citations' },
    { key: 'workspace', label: t.workspace, path: '/playground' },
  ];

  const currentLinks = mode === 'landing' ? navLinksLanding : navLinksPlayground;

  const handleScrollTo = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="w-full h-16 md:h-20 flex items-center justify-between px-6 md:px-8 bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray shrink-0 transition-colors z-50 sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer w-[150px] shrink-0" onClick={handleLogoClick}>
          <img 
            src={theme === 'dark' ? '/assets/dark/fuenzer-research-logo-dark.webp' : '/assets/light/fuenzer-research-logo-light.webp'} 
            alt="Fuenzer Research Logo" 
            className="w-full h-auto object-contain object-left"
          />
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 justify-center items-center gap-8 h-full">
          {currentLinks.map((link) => (
            <div
              key={link.key}
              onClick={() => {
                if (mode === 'landing') {
                  handleScrollTo(link.key);
                } else {
                  // @ts-ignore
                  navigate(link.path);
                }
              }}
              className={`h-full flex items-center text-sm font-semibold cursor-pointer border-b-2 px-1 transition-colors ${
                // @ts-ignore
                (mode === 'playground' && location.pathname === link.path)
                  ? 'border-fuenzer-teal text-fuenzer-teal-dark dark:text-fuenzer-teal'
                  : 'border-transparent text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white'
              }`}
            >
              {link.label}
            </div>
          ))}
        </div>

        {/* Right Actions & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-5">
          {/* History / Recent Dropdown (Desktop) */}
          <div className="relative hidden xl:block" ref={historyRef}>
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray"
              aria-label="History"
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {isHistoryOpen && (
              <div className="absolute top-12 right-0 w-72 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl overflow-hidden animate-in fade-in">
                <div className="px-4 py-3 border-b border-cloud-canvas dark:border-stone-gray flex justify-between items-center">
                  <h4 className="font-bold text-sm dark:text-cloud-canvas">{t.recentSearches}</h4>
                  {recentHistory.length > 0 && (
                    <button 
                      onClick={() => { setIsHistoryOpen(false); setIsHistoryModalOpen(true); }}
                      className="text-[10px] font-bold text-fuenzer-teal hover:underline"
                    >
                      {t.seeAll}
                    </button>
                  )}
                </div>
                {recentHistory.length === 0 ? (
                  <div className="text-center py-5 px-4">
                    <p className="text-sm font-medium text-ink-black dark:text-paper-white mb-1">{t.noHistoryYet}</p>
                    <p className="text-[10px] text-slate-gray dark:text-silver-mist">{t.noHistoryDesc}</p>
                  </div>
                ) : (
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {recentHistory.slice(0, 5).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setIsHistoryOpen(false);
                          loadSession(item.id);
                          navigate('/playground');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-black dark:text-cloud-canvas hover:bg-cloud-canvas/60 dark:hover:bg-stone-gray/30 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-silver-mist shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Translate Button (Desktop) */}
          <button 
            onClick={toggleLanguage}
            className="hidden xl:flex items-center gap-1 text-sm font-semibold text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'EN' : 'ID'}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          {/* Notification Dropdown */}
          <div className="relative hidden xl:block" ref={notifRef}>
             <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-colors rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray"
              aria-label="Notifications"
             >
               <Bell className="w-4 h-4 md:w-5 md:h-5" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-paper-white dark:border-ink-black"></span>
             </button>
             {isNotifOpen && (
              <div className="absolute top-12 right-0 w-72 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl p-4 animate-in fade-in">
                <h4 className="font-bold text-sm mb-2 dark:text-cloud-canvas">{t.notifications}</h4>
                <p className="text-xs text-slate-gray dark:text-silver-mist mb-4">{t.notifDesc}</p>
                <button 
                  onClick={() => {
                    setIsNotifOpen(false);
                    setIsLogModalOpen(true);
                  }}
                  className="w-full text-center text-xs font-bold bg-fuenzer-teal text-white py-2 rounded-lg hover:bg-fuenzer-teal-dark transition-colors"
                >
                  {t.viewDetails}
                </button>
              </div>
            )}
          </div>
          
          
          <div className="flex items-center gap-3 md:gap-4">
            {(() => {
              const { user } = useAuthStore();
              const isAuthenticated = user && !user.isAnonymous;

              if (isAuthenticated) {
                return <UserMenu />;
              }

              // Not authenticated (anonymous or no user)
              return (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-xs md:text-sm font-semibold text-fuenzer-teal-dark dark:text-fuenzer-teal hover:text-fuenzer-teal cursor-pointer"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-3 py-1.5 md:px-5 md:py-2 rounded-lg bg-fuenzer-teal-dark text-white text-xs md:text-sm font-bold tracking-wide hover:bg-fuenzer-teal hover:text-white transition-all cursor-pointer"
                  >
                    {t.signup}
                  </button>
                </>
              );
            })()}
          </div>

          {/* Mobile Menu Hamburger */}
          <button 
            className="xl:hidden p-2 text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white rounded-full hover:bg-cloud-canvas dark:hover:bg-stone-gray transition-colors"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed top-16 md:top-20 left-0 w-full bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray shadow-xl flex flex-col p-6 z-40 animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-4 mb-6">
            {currentLinks.map((link) => (
              <div
                key={link.key}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (mode === 'landing') {
                    handleScrollTo(link.key);
                  } else {
                    // @ts-ignore
                    navigate(link.path);
                  }
                }}
                className="text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal transition-colors"
              >
                {link.label}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-cloud-canvas dark:border-stone-gray">
             <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                toggleLanguage();
              }}
              className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer"
            >
              <Globe className="w-5 h-5 text-slate-gray" />
              {t.changeLanguage} ({language === 'en' ? 'EN' : 'ID'})
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLogModalOpen(true);
              }}
              className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal"
            >
              <Bell className="w-5 h-5 text-slate-gray" />
              {t.viewNotifications}
            </button>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsHistoryModalOpen(true);
                }}
                className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal"
              >
                <History className="w-5 h-5 text-slate-gray" />
                {t.history}
              </button>
            </div>
          </div>
        </div>
      )}

      <UpdateLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
    </>
  );
}
