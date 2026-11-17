/**
 * Checks if the email format is valid.
 */
export function isEmailValid(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Checks if the password length is at least 6 characters.
 */
export function isPasswordValid(password: string): boolean {
  if (!password) return true;
  return password.length >= 6;
}

/**
 * Parses a URL string and returns its normalized href only for http: or https: protocols.
 * Rejects javascript:, data:, vbscript:, or malformed URLs.
 */
export function toSafeHttpUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
