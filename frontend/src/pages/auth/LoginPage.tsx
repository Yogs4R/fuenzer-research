import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Send } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { AuthLayout } from '../../components/shared/AuthLayout';
import { OAuthProviders } from '../../components/auth/OAuthProviders';
import { isEmailValid, isPasswordValid } from '../../utils/validation';

export function LoginPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/login/',
  });
  const navigate = useNavigate();
  const { 
    loginWithEmail, 
    sendResetEmail, 
    loading, 
    error, 
    clearError 
  } = useAuthStore();
  const { language } = useUiStore();
  const isEn = language === 'en';

  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validation & Touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = emailTouched && !isEmailValid(email);
  const passwordError = passwordTouched && !isPasswordValid(password);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await loginWithEmail(email, password);
    if (!useAuthStore.getState().error) {
      navigate('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !isEmailValid(email)) return;
    setResetSuccess(false);
    clearError();
    try {
      await sendResetEmail(email.trim());
      setResetSuccess(true);
    } catch (err) {
      // Error is set in the store
    }
  };

  const handleBackAction = () => {
    if (view === 'forgot-password') {
      setView('login');
      clearError();
      setResetSuccess(false);
    } else {
      navigate('/');
    }
  };

  return (
    <AuthLayout
      title={view === 'login' ? 'Welcome Back' : (isEn ? 'Forgot Password' : 'Lupa Password')}
      subtitle={
        view === 'login'
          ? 'Sign in to access your research workspace'
          : (isEn ? 'Enter your email to receive a password reset link' : 'Masukkan email Anda untuk menerima tautan reset password')
      }
      error={error}
      onErrorDismiss={clearError}
      showBackButton={true}
      backButtonCallback={handleBackAction}
      backButtonTitle={view === 'forgot-password' ? (isEn ? 'Back to Login' : 'Kembali ke Login') : 'Back to Home'}
    >
      {/* Reset Success Message */}
      {view === 'forgot-password' && resetSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/30 text-teal-600 dark:text-teal-400 text-xs font-sans">
          {isEn
            ? 'A password reset link has been sent to your email. Please check your inbox or spam folder.'
            : 'Tautan reset password telah dikirim ke email Anda. Silakan periksa folder masuk atau spam.'}
        </div>
      )}

      {view === 'login' ? (
        <>
          <OAuthProviders loading={loading} />

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-cloud-canvas dark:bg-stone-gray" />
            <span className="text-xs text-silver-mist font-sans">or sign in with email</span>
            <div className="flex-1 h-px bg-cloud-canvas dark:bg-stone-gray" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="Email address"
                  required
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:ring-1 transition-colors font-sans ${
                    emailError
                      ? 'border-red-500 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-cloud-canvas dark:border-stone-gray focus:border-fuenzer-teal focus:ring-fuenzer-teal/30'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
                  {isEn ? 'Please enter a valid email address.' : 'Masukkan format email yang valid.'}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-xs font-bold text-slate-gray dark:text-silver-mist font-sans">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot-password');
                    clearError();
                    setResetSuccess(false);
                  }}
                  className="text-[11px] text-fuenzer-teal hover:text-fuenzer-teal-dark font-semibold hover:underline cursor-pointer font-sans"
                >
                  {isEn ? 'Forgot Password?' : 'Lupa Password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Password"
                  required
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:ring-1 transition-colors font-sans ${
                    passwordError
                      ? 'border-red-500 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-cloud-canvas dark:border-stone-gray focus:border-fuenzer-teal focus:ring-fuenzer-teal/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver-mist hover:text-ink-black dark:hover:text-paper-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
                  {isEn ? 'Password must be at least 6 characters.' : 'Password minimal harus 6 karakter.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center font-sans">
            <p className="text-sm text-slate-gray dark:text-silver-mist">
              Don't have an account?{' '}
              <Link to="/signup" className="text-fuenzer-teal font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
            <Link to="/" className="inline-block mt-3 text-xs text-silver-mist hover:text-fuenzer-teal transition-colors">
              Continue as guest
            </Link>
          </div>
        </>
      ) : (
        /* Forgot Password view */
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="Email address"
                required
                className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:ring-1 transition-colors font-sans ${
                  emailError
                    ? 'border-red-500 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-cloud-canvas dark:border-stone-gray focus:border-fuenzer-teal focus:ring-fuenzer-teal/30'
                }`}
              />
            </div>
            {emailError && (
              <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
                {isEn ? 'Please enter a valid email address.' : 'Masukkan format email yang valid.'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !isEmailValid(email)}
            className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isEn ? 'Send Reset Link' : 'Kirim Tautan Reset'}
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-6 text-center font-sans">
            <button
              type="button"
              onClick={() => {
                setView('login');
                clearError();
                setResetSuccess(false);
              }}
              className="text-sm text-fuenzer-teal font-semibold hover:underline cursor-pointer"
            >
              {isEn ? 'Back to Login' : 'Kembali ke Login'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
