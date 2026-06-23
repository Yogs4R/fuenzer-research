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
