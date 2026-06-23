import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import zxcvbn from 'zxcvbn';
import { AuthLayout } from '../../components/shared/AuthLayout';
import { OAuthProviders } from '../../components/auth/OAuthProviders';
import { isEmailValid, isPasswordValid } from '../../utils/validation';

export function SignUpPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/signup/',
  });
  const navigate = useNavigate();
  const { registerWithEmail, loading, error, clearError } = useAuthStore();
  const { language } = useUiStore();
  const isEn = language === 'en';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Validation & Touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const doPasswordsMatch = () => {
    return password === confirmPassword;
  };

  const emailError = emailTouched && !isEmailValid(email);
  const passwordError = passwordTouched && !isPasswordValid(password);
  const confirmPasswordError = confirmPasswordTouched && !doPasswordsMatch();

  // Password score using zxcvbn (0 - 4)
  const passwordResult = password ? zxcvbn(password) : null;
  const passwordScore = passwordResult ? passwordResult.score : -1;

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
        return { label: isEn ? 'Very Weak' : 'Sangat Lemah', color: 'text-red-500', barColor: 'bg-red-500' };
      case 1:
        return { label: isEn ? 'Weak' : 'Lemah', color: 'text-orange-500', barColor: 'bg-orange-500' };
      case 2:
        return { label: isEn ? 'Fair' : 'Cukup', color: 'text-yellow-500', barColor: 'bg-yellow-500' };
      case 3:
        return { label: isEn ? 'Strong' : 'Kuat', color: 'text-green-500', barColor: 'bg-green-500' };
      case 4:
        return { label: isEn ? 'Very Strong' : 'Sangat Kuat', color: 'text-teal-500 dark:text-teal-400', barColor: 'bg-teal-500' };
      default:
        return { label: '', color: 'text-slate-300', barColor: 'bg-slate-200 dark:bg-stone-800' };
    }
  };

  const strength = getStrengthLabel(passwordScore);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError(isEn ? 'Passwords do not match.' : 'Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setLocalError(isEn ? 'Password must be at least 6 characters.' : 'Password minimal harus 6 karakter.');
      return;
    }

    // Auto-extract displayName from email (everything before @)
    const derivedDisplayName = email.split('@')[0];

    await registerWithEmail(email, password, derivedDisplayName);
    if (!useAuthStore.getState().error) {
      navigate('/');
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Fuenzer Research and sync your workspace across devices"
      error={displayError}
      onErrorDismiss={() => {
        clearError();
        setLocalError('');
      }}
      showBackButton={true}
      backButtonCallback={() => navigate('/')}
      backButtonTitle="Back to Home"
    >
      <OAuthProviders loading={loading} googleLabel="Sign up with Google" microsoftLabel="Sign up with Microsoft" />

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-cloud-canvas dark:bg-stone-gray" />
        <span className="text-xs text-silver-mist font-sans">or create with email</span>
        <div className="flex-1 h-px bg-cloud-canvas dark:bg-stone-gray" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailSignUp} className="space-y-4">
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
              Masukkan format email yang valid.
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
              placeholder={isEn ? "Password (max 64 characters)" : "Password (maksimal 64 huruf)"}
              required
              minLength={6}
              maxLength={64}
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

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 pl-1 pr-1">
              {/* Segmented Bar */}
              <div className="flex gap-1 h-1">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 h-full rounded-full transition-all duration-300 ${
                      index <= passwordScore
                        ? strength.barColor
                        : 'bg-cloud-canvas dark:bg-stone-gray/30'
                    }`}
                  />
                ))}
              </div>
              {/* Dynamic Label */}
              <div className="flex justify-between items-center mt-1 text-[10px] font-sans">
                <span className="text-slate-gray dark:text-silver-mist">
                  {isEn ? 'Password strength:' : 'Kekuatan password:'}
                </span>
                <span className={`font-bold ${strength.color}`}>{strength.label}</span>
              </div>
            </div>
          )}

          {passwordError && (
            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
              {isEn ? 'Password must be at least 6 characters.' : 'Password minimal harus 6 karakter.'}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              placeholder="Confirm password"
              required
              minLength={6}
              maxLength={64}
              className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:ring-1 transition-colors font-sans ${
                confirmPasswordError
                  ? 'border-red-500 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-cloud-canvas dark:border-stone-gray focus:border-fuenzer-teal focus:ring-fuenzer-teal/30'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver-mist hover:text-ink-black dark:hover:text-paper-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-sans pl-1">
              {isEn ? 'Passwords do not match.' : 'Password dan konfirmasi password tidak cocok.'}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim() || !confirmPassword.trim() || password !== confirmPassword}
          className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer links */}
      <div className="mt-6 text-center font-sans">
        <p className="text-sm text-slate-gray dark:text-silver-mist">
          Already have an account?{' '}
          <Link to="/login" className="text-fuenzer-teal font-semibold hover:underline">
            Sign In
          </Link>
        </p>
        <Link to="/" className="inline-block mt-3 text-xs text-silver-mist hover:text-fuenzer-teal transition-colors">
          Continue as guest
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-[10px] text-silver-mist mt-4 font-sans">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-fuenzer-teal">Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" className="underline hover:text-fuenzer-teal">Privacy Policy</Link>
      </p>
    </AuthLayout>
  );
}
