import { Link, useNavigate } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  error?: string | null;
  onErrorDismiss?: () => void;
  showBackButton?: boolean;
  backButtonCallback?: () => void;
  backButtonTitle?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  error,
  onErrorDismiss,
  showBackButton = false,
  backButtonCallback,
  backButtonTitle,
}: AuthLayoutProps) {
  const { theme, language } = useUiStore();
  const isEn = language === 'en';
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonCallback) {
      backButtonCallback();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src={
                theme === 'dark'
                  ? '/assets/dark/fuenzer-research-logo-dark.webp'
                  : '/assets/light/fuenzer-research-logo-light.webp'
              }
              alt="Fuenzer Research"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 relative transition-all duration-300">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="absolute top-6 left-6 flex items-center justify-center w-8 h-8 rounded-full border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-all shadow-sm cursor-pointer"
              title={backButtonTitle || (isEn ? 'Back' : 'Kembali')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">
                {subtitle}
              </p>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans flex items-center justify-between">
              <span className="flex-1">{error}</span>
              {onErrorDismiss && (
                <button
                  onClick={onErrorDismiss}
                  className="ml-2 underline text-[10px] cursor-pointer shrink-0 font-semibold"
                >
                  {isEn ? 'Dismiss' : 'Tutup'}
                </button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
