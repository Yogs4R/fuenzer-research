import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useUiStore } from '../../store/uiStore';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { AuthLayout } from '../../components/shared/AuthLayout';

export function ResetPasswordPage() {
  useSEO({
    canonical: 'https://research.fuenzer.web.id/reset-password/',
  });
  const location = useLocation();
  const { language } = useUiStore();
  const isEn = language === 'en';

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse oobCode from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('oobCode');
    if (!code) {
      setError(isEn ? 'Invalid or expired password reset link.' : 'Tautan reset password tidak valid atau telah kedaluwarsa.');
      setVerifying(false);
      return;
    }
    setOobCode(code);

    // Verify reset code with Firebase
    verifyPasswordResetCode(auth, code)
      .then((userEmail) => {
        setEmail(userEmail);
        setVerifying(false);
      })
      .catch((err) => {
        console.error(err);
        setError(isEn ? 'This reset link has expired or already been used.' : 'Tautan reset ini telah kedaluwarsa atau sudah digunakan.');
        setVerifying(false);
      });
  }, [location.search, isEn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || password.length < 6) return;
    if (password !== confirmPassword) {
      setValidationError(isEn ? 'Passwords do not match.' : 'Password tidak cocok.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setValidationError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      setError(isEn ? 'Failed to reset password. Please try again.' : 'Gagal mereset password. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  const getLayoutProps = () => {
    if (verifying) {
      return {
        title: isEn ? 'Reset Password' : 'Atur Ulang Password',
        subtitle: isEn ? 'Verifying link...' : 'Memverifikasi tautan...',
      };
    }
    if (error && !email) {
      return {
        title: isEn ? 'Invalid Link' : 'Tautan Tidak Valid',
        subtitle: error,
      };
    }
    if (success) {
      return {
        title: isEn ? 'Success!' : 'Berhasil!',
        subtitle: isEn ? 'Your password has been successfully reset!' : 'Password Anda telah berhasil diatur ulang!',
      };
    }
    return {
      title: isEn ? 'Reset Password' : 'Atur Ulang Password',
      subtitle: isEn ? `Create a new password for ${email}` : `Buat password baru untuk ${email}`,
    };
  };

  const layoutProps = getLayoutProps();

  return (
    <AuthLayout
      title={layoutProps.title}
      subtitle={layoutProps.subtitle}
      error={validationError}
      onErrorDismiss={() => setValidationError(null)}
      showBackButton={true}
      backButtonTitle={isEn ? 'Back to Login' : 'Kembali ke Login'}
    >
      {verifying ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-8 h-8 border-3 border-fuenzer-teal/30 border-t-fuenzer-teal rounded-full animate-spin" />
        </div>
      ) : error && !email ? (
        <div className="text-center py-4 space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <Link
            to="/login"
            className="flex w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors items-center justify-center gap-2 font-sans"
          >
            {isEn ? 'Back to Login' : 'Kembali ke Login'}
          </Link>
        </div>
      ) : success ? (
        <div className="text-center py-4 space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-teal-500" />
          </div>
          <Link
            to="/login"
            className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors flex items-center justify-center gap-2 font-sans"
          >
            {isEn ? 'Go to Login' : 'Masuk Sekarang'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs font-sans">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
              {isEn ? 'New Password' : 'Password Baru'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEn ? "At least 6 characters" : "Minimal 6 karakter"}
                required
                minLength={6}
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:border-fuenzer-teal focus:ring-1 focus:ring-fuenzer-teal/30 transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-silver-mist hover:text-ink-black dark:hover:text-paper-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-gray dark:text-silver-mist pl-1 font-sans">
              {isEn ? 'Confirm New Password' : 'Konfirmasi Password Baru'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirm-password"
                name="confirm-password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isEn ? "Confirm password" : "Ulangi password"}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-cloud-canvas/30 dark:bg-stone-gray/20 text-sm text-ink-black dark:text-paper-white placeholder:text-silver-mist outline-none focus:border-fuenzer-teal focus:ring-1 focus:ring-fuenzer-teal/30 transition-colors font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || password.length < 6 || password !== confirmPassword}
            className="w-full h-11 rounded-xl bg-fuenzer-teal-dark text-white text-sm font-bold hover:bg-fuenzer-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans cursor-pointer mt-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isEn ? 'Reset Password' : 'Reset Password'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

