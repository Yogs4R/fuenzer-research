import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Mail, RefreshCw, Send, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useSEO } from '../../hooks/useSEO';
import { en } from '../../locales/en';
import { id } from '../../locales/id';

export function VerifyEmailPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/verify-email/',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, reloadUser, sendVerificationEmail, logout, loading, error, clearError } = useAuthStore();
  const { theme, language } = useUiStore();
  const t = language === 'en' ? en : id;
  
  const [cooldown, setCooldown] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Auto-verification states
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Handle countdown cooldown for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Protect normal page view: redirect if user verified or not signed in (unless processing link)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('oobCode')) return; // bypass protection during auto-verification

    if (!user) {
      navigate('/login');
    } else if (user.isAnonymous) {
      navigate('/');
    } else if (user.emailVerified) {
      navigate('/');
    }
  }, [user, navigate, location.search]);

  // Process oobCode on mount if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');
    if (code) {
      setVerifyingCode(true);
      setVerificationError(null);

      applyActionCode(auth, code)
        .then(async () => {
          setVerificationSuccess(true);
          setVerifyingCode(false);
          // Sync with the local auth store if logged in
          if (auth.currentUser) {
            await reloadUser();
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        })
        .catch((err) => {
          console.error('[Auth] Email verification failed:', err);
          setVerificationError(t.auth.invalidLink);
          setVerifyingCode(false);
        });
    }
  }, [location.search, reloadUser, navigate]);

  const handleCheckVerification = async () => {
    clearError();
    setSuccessMsg('');
    setStatusMsg('');
    
    await reloadUser();
    
    // Check updated store state
    const updatedUser = useAuthStore.getState().user;
    if (updatedUser?.emailVerified) {
      navigate('/');
    } else {
      setStatusMsg(t.auth.emailNotVerified);
    }
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    clearError();
    setSuccessMsg('');
    setStatusMsg('');
    
    try {
      await sendVerificationEmail();
      setSuccessMsg(t.auth.newVerificationSent);
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      // Error is set in store
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Render verifying state
  if (verifyingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
        <div className="w-full max-w-md bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 text-center transition-all duration-300">
          <div className="w-8 h-8 border-3 border-fuenzer-teal/30 border-t-fuenzer-teal rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-ink-black dark:text-paper-white font-serif mb-2">{t.auth.verifyingTitle}</h1>
          <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">{t.auth.verifyingDesc}</p>
        </div>
      </div>
    );
  }

  // Render verification success state
  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
        <div className="w-full max-w-md bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 text-center transition-all duration-300 space-y-6">
          <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif">{t.auth.verifiedTitle}</h1>
            <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">{t.auth.verifiedDesc}</p>
          </div>
          {auth.currentUser ? (
            <p className="text-xs text-silver-mist font-sans animate-pulse">{t.auth.redirecting}</p>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors flex items-center justify-center font-sans cursor-pointer"
            >
              {t.auth.loginToApp}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render verification error state
  if (verificationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
        <div className="w-full max-w-md bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 text-center transition-all duration-300 space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif">{t.auth.verificationFailed}</h1>
            <p className="text-sm text-red-500 font-sans">{verificationError}</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors flex items-center justify-center font-sans cursor-pointer"
          >
            {t.auth.backToLogin}
          </button>
        </div>
      </div>
    );
  }

  // Render fallback protection check
  if (!user || user.isAnonymous || user.emailVerified) {
    return null; // let redirects process
  }

  // Render normal manual verification page
  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud-canvas dark:bg-[#121212] px-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={theme === 'dark' ? '/assets/dark/fuenzer-research-logo-dark.webp' : '/assets/light/fuenzer-research-logo-light.webp'}
            alt="Fuenzer Research"
            className="h-10 w-auto"
          />
        </div>

        {/* Card */}
        <div className="bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 relative transition-all duration-300">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-fuenzer-teal/10 dark:bg-fuenzer-teal/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-fuenzer-teal" />
            </div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif mb-2">
              {t.auth.verifyEmailTitle}
            </h1>
            <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">
              {t.auth.emailSentTo}
            </p>
            <p className="text-sm font-bold text-ink-black dark:text-paper-white mt-1 select-all font-sans">
              {user.email}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans flex items-center justify-between">
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="ml-2 underline text-[10px] cursor-pointer shrink-0 font-semibold">{t.auth.close}</button>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/30 text-teal-600 dark:text-teal-400 text-xs font-sans">
              {successMsg}
            </div>
          )}

          {statusMsg && !error && !successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs font-sans">
              {statusMsg}
            </div>
          )}

          <div className="space-y-3 font-sans">
            <button
              onClick={handleCheckVerification}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-fuenzer-teal dark:bg-fuenzer-teal-dark hover:bg-fuenzer-teal/95 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t.auth.iHaveVerified}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading || cooldown > 0}
              className="w-full h-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-[#1A1A1A] hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 transition-colors text-sm font-semibold text-ink-black dark:text-paper-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-silver-mist" />
              {cooldown > 0 ? `${t.auth.resendEmailWait} (${cooldown}s)` : t.auth.resendEmail}
            </button>

            <div className="border-t border-cloud-canvas dark:border-stone-gray pt-4 mt-4">
              <button
                onClick={handleLogout}
                className="w-full h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                {t.auth.logout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
