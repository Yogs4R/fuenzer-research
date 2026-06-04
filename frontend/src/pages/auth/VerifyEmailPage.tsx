import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Mail, RefreshCw, Send, LogOut } from 'lucide-react';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, reloadUser, sendVerificationEmail, logout, loading, error, clearError } = useAuthStore();
  const { theme } = useUiStore();
  
  const [cooldown, setCooldown] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Handle countdown cooldown for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Protect page: if no user is signed in, or if user is anonymous, or if email is verified: redirect away
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.isAnonymous) {
      navigate('/');
    } else if (user.emailVerified) {
      navigate('/');
    }
  }, [user, navigate]);

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
      setStatusMsg('Email Anda belum terverifikasi. Silakan periksa kotak masuk atau spam email Anda.');
    }
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    clearError();
    setSuccessMsg('');
    setStatusMsg('');
    
    try {
      await sendVerificationEmail();
      setSuccessMsg('Email verifikasi baru telah dikirim.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      // Error is set in store
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.isAnonymous || user.emailVerified) {
    return null; // let redirect run
  }

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
              Verifikasi Email Anda
            </h1>
            <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">
              Kami telah mengirimkan tautan verifikasi ke email:
            </p>
            <p className="text-sm font-bold text-ink-black dark:text-paper-white mt-1 select-all font-sans">
              {user.email}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans flex items-center justify-between">
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="ml-2 underline text-[10px] cursor-pointer shrink-0 font-semibold">Tutup</button>
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
              Saya Sudah Verifikasi
            </button>

            <button
              onClick={handleResendEmail}
              disabled={loading || cooldown > 0}
              className="w-full h-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-[#1A1A1A] hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 transition-colors text-sm font-semibold text-ink-black dark:text-paper-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-silver-mist" />
              {cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : 'Kirim Ulang Email Verifikasi'}
            </button>

            <div className="border-t border-cloud-canvas dark:border-stone-gray pt-4 mt-4">
              <button
                onClick={handleLogout}
                className="w-full h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar / Ganti Akun
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
