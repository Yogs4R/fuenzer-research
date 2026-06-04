/**
 * authErrors.ts — Firebase Auth error code translator.
 * Maps standard Firebase Auth error codes to human-readable Indonesian or English messages.
 */

export function getFriendlyErrorMessage(error: any, lang: 'en' | 'id' = 'id'): string {
  const code = error?.code || (typeof error === 'string' ? error : '');
  const isEn = lang === 'en';

  switch (code) {
    case 'auth/invalid-email':
      return isEn 
        ? 'The email address format is invalid.' 
        : 'Format email yang Anda masukkan tidak valid.';
    case 'auth/user-disabled':
      return isEn 
        ? 'This account has been disabled. Please contact support.' 
        : 'Akun ini telah dinonaktifkan. Silakan hubungi dukungan.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return isEn 
        ? 'Incorrect email or password.' 
        : 'Email atau password yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return isEn 
        ? 'This email address is already registered. Please sign in or use another email.' 
        : 'Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.';
    case 'auth/weak-password':
      return isEn 
        ? 'Password is too weak. Password must be at least 6 characters.' 
        : 'Password terlalu lemah. Password minimal harus 6 karakter.';
    case 'auth/popup-closed-by-user':
      return isEn 
        ? 'Sign in was cancelled because the login window was closed.' 
        : 'Proses masuk dibatalkan karena jendela login ditutup.';
    case 'auth/too-many-requests':
      return isEn 
        ? 'Too many failed login attempts. Your account has been temporarily suspended. Please try again later.' 
        : 'Terlalu banyak percobaan masuk yang gagal. Akun Anda telah ditangguhkan sementara. Silakan coba lagi nanti.';
    case 'auth/network-request-failed':
      return isEn 
        ? 'Network error. Please check your internet connection.' 
        : 'Koneksi jaringan bermasalah. Periksa koneksi internet Anda.';
    case 'auth/internal-error':
      return isEn 
        ? 'An internal server error occurred. Please try again later.' 
        : 'Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi.';
    case 'auth/cancelled-popup-request':
      return isEn 
        ? 'Sign in was cancelled due to multiple popup requests.' 
        : 'Proses masuk dibatalkan karena permintaan popup ganda.';
    case 'auth/operation-not-allowed':
      return isEn 
        ? 'This sign-in method is not enabled. Contact the administrator.' 
        : 'Metode masuk ini belum diaktifkan. Hubungi administrator.';
    default:
      if (error?.message) {
        const cleanMsg = error.message.replace(/^Firebase:\s*/, '');
        if (cleanMsg.includes('popup-closed-by-user')) {
          return isEn 
            ? 'Sign in was cancelled because the login window was closed.' 
            : 'Proses masuk dibatalkan karena jendela login ditutup.';
        }
        return cleanMsg;
      }
      return isEn 
        ? 'Authentication error occurred. Please try again.' 
        : 'Terjadi kesalahan autentikasi. Silakan coba lagi.';
  }
}
