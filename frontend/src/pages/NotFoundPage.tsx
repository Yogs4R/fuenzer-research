import { useLocation, Link } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { ArrowLeft, Home } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export function NotFoundPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/',
  });
  const { theme, language } = useUiStore();
  const location = useLocation();
  const isEn = language === 'en';

  // Check if router passed any custom error code or message
  const errorCode = location.state?.code || '404';
  const errorTitle = location.state?.title || (isEn ? 'Page Not Found' : 'Halaman Tidak Ditemukan');
  const errorDesc = location.state?.description || 
    (isEn 
      ? `The path "${location.pathname}" could not be found. Please check the URL or return to safety.`
      : `Halaman "${location.pathname}" tidak dapat ditemukan. Silakan periksa kembali URL Anda.`);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src={theme === 'dark' ? '/assets/dark/fuenzer-research-logo-dark.webp' : '/assets/light/fuenzer-research-logo-light.webp'}
              alt="Fuenzer Research"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 relative transition-all duration-300 space-y-6">
          <div className="mx-auto w-24 h-24 bg-fuenzer-teal/10 dark:bg-fuenzer-teal/20 rounded-full flex items-center justify-center">
            <span className="text-4xl font-extrabold text-fuenzer-teal font-sans leading-none tracking-tight">
              {errorCode}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif">
              {errorTitle}
            </h1>
            <p className="text-sm text-slate-gray dark:text-silver-mist font-sans px-2">
              {errorDesc}
            </p>
          </div>

          <div className="divider h-px bg-cloud-canvas dark:bg-stone-gray" />

          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={() => window.history.back()}
              className="h-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-[#1A1A1A] hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 transition-colors text-sm font-semibold text-ink-black dark:text-paper-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-silver-mist" />
              {isEn ? 'Go Back' : 'Kembali'}
            </button>

            <Link
              to="/"
              className="h-11 rounded-xl bg-fuenzer-teal dark:bg-fuenzer-teal-dark hover:bg-fuenzer-teal/95 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4" />
              {isEn ? 'Home' : 'Beranda'}
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-xs text-silver-mist font-sans">
          &copy; 2026 Fuenzer Research. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
