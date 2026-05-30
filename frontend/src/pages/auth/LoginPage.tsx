import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithMicrosoft, loginWithEmail, loading, error, clearError } = useAuthStore();
  const { theme } = useUiStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isEmailValid = (val: string) => {
    if (!val) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const isPasswordValid = (val: string) => {
    if (!val) return true;
    return val.length >= 6;
  };

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

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    if (!useAuthStore.getState().error) {
      navigate('/');
    }
  };

  const handleMicrosoftLogin = async () => {
    await loginWithMicrosoft();
    if (!useAuthStore.getState().error) {
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
              src={theme === 'dark' ? '/assets/dark/fuenzer-research-logo-dark.webp' : '/assets/light/fuenzer-research-logo-light.webp'}
              alt="Fuenzer Research"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-paper-white dark:bg-ink-black rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray p-8 relative">
          {/* Back to Home floating arrow button inside the card */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 flex items-center justify-center w-8 h-8 rounded-full border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-all shadow-sm cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-gray dark:text-silver-mist font-sans">
              Sign in to access your research workspace
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans">
              {error}
              <button onClick={clearError} className="ml-2 underline text-[10px]">Dismiss</button>
            </div>
          )}

          {/* OAuth Providers */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-[#1A1A1A] hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 transition-colors text-sm font-semibold text-ink-black dark:text-paper-white disabled:opacity-50 cursor-pointer font-sans"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-[#1A1A1A] hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/30 transition-colors text-sm font-semibold text-ink-black dark:text-paper-white disabled:opacity-50 cursor-pointer font-sans"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
                <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
                <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
                <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

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
                  Please enter a valid email address.
                </p>
              )}
            </div>
 
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:ring-1 transition-colors font-sans ${
                    passwordError
                      ? 'border-red-500 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-cloud-canvas dark:border-stone-gray focus:border-fuenzer-teal focus:ring-fuenzer-teal/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver-mist hover:text-ink-black dark:hover:text-paper-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
                  Password must be at least 6 characters.
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
        </div>
      </div>
    </div>
  );
}
