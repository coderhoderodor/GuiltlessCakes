/**
 * Password Validation
 *
 * Enforces strong password requirements.
 */

import { z } from 'zod';

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a password against all requirements.
 * Returns all validation errors at once for better UX.
 *
 * @param password - The password to validate
 * @returns Validation result with all errors
 *
 * @example
 * const result = validatePassword('weak');
 * if (!result.valid) {
 *   setErrors(result.errors);
 * }
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength feedback.
 * Useful for password strength meters.
 *
 * @param password - The password to check
 * @returns Strength level and feedback
 */
export function getPasswordStrength(password: string): {
  level: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} {
  let score = 0;

  // Length points
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety points
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 3) {
    level = 'weak';
  } else if (score <= 5) {
    level = 'fair';
  } else if (score <= 6) {
    level = 'good';
  } else {
    level = 'strong';
  }

  return { level, score };
}
