import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Bell, History, Globe, Menu, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { en } from '../../locales/en';
import { id } from '../../locales/id';
import { UpdateLogModal } from './UpdateLogModal';
import { HistoryModal } from './HistoryModal';

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
  
  const notifRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

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
    { key: 'recent', label: t.recent },
    { key: 'library', label: t.library },
    { key: 'citations', label: t.citations },
    { key: 'workspace', label: t.workspace },
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
              onClick={() => mode === 'landing' ? handleScrollTo(link.key) : undefined}
              className={`h-full flex items-center text-sm font-semibold cursor-pointer border-b-2 px-1 transition-colors ${
                mode === 'playground' && link.key === 'workspace'
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
              <div className="absolute top-12 right-0 w-64 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl p-4 animate-in fade-in">
                <h4 className="font-bold text-sm mb-3 dark:text-cloud-canvas">Recent Prompts</h4>
                <div className="text-center py-4">
                  <p className="text-sm font-medium text-ink-black dark:text-paper-white mb-1">No History Yet</p>
                  <p className="text-[10px] text-slate-gray dark:text-silver-mist">Your recent searches will appear here.</p>
                </div>
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
                <h4 className="font-bold text-sm mb-2 dark:text-cloud-canvas">Notifications</h4>
                <p className="text-xs text-slate-gray dark:text-silver-mist mb-4">Version 1.2 is out! New AI models and localized indexing are now live.</p>
                <button 
                  onClick={() => {
                    setIsNotifOpen(false);
                    setIsLogModalOpen(true);
                  }}
                  className="w-full text-center text-xs font-bold bg-fuenzer-teal text-white py-2 rounded-lg hover:bg-fuenzer-teal-dark transition-colors"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
          
          
          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-xs md:text-sm font-semibold text-fuenzer-teal-dark dark:text-fuenzer-teal hover:text-fuenzer-teal">
              {t.login}
            </button>
            <button className="px-3 py-1.5 md:px-5 md:py-2 rounded-lg bg-fuenzer-teal-dark text-white text-xs md:text-sm font-bold tracking-wide hover:bg-fuenzer-teal hover:text-white transition-all">
              {t.signup}
            </button>
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
                onClick={() => mode === 'landing' ? handleScrollTo(link.key) : undefined}
                className="text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal transition-colors"
              >
                {link.label}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-cloud-canvas dark:border-stone-gray">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer"
            >
              <Globe className="w-5 h-5 text-slate-gray" />
              Change Language ({language === 'en' ? 'EN' : 'ID'})
            </button>
            <button 
              onClick={() => {
                // Don't close the menu, just open the modal on top
                setIsLogModalOpen(true);
              }}
              className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal"
            >
              <Bell className="w-5 h-5 text-slate-gray" />
              View Notifications
            </button>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsHistoryModalOpen(true)}
                className="flex items-center gap-3 text-lg font-semibold text-ink-black dark:text-cloud-canvas cursor-pointer hover:text-fuenzer-teal"
              >
                <History className="w-5 h-5 text-slate-gray" />
                History
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
