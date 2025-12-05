/**
 * Auth Utilities
 *
 * Security helpers for authentication flows.
 */

/**
 * Sanitize redirect path to prevent open redirect attacks.
 *
 * Prevents:
 * - Protocol-relative URLs (//evil.com)
 * - Absolute URLs with protocols (http://evil.com, javascript:alert(1))
 * - URLs that could be interpreted as external
 *
 * @param path - The redirect path from query params
 * @returns Safe path or '/' as fallback
 */
export function sanitizeRedirectPath(path: string | null): string {
  // No path provided
  if (!path) return '/';

  // Must start with a single forward slash (relative path)
  if (!path.startsWith('/')) return '/';

  // Block protocol-relative URLs (//evil.com)
  if (path.startsWith('//')) return '/';

  // Block any protocol attempts (javascript:, http:, data:, etc.)
  if (path.includes(':')) return '/';

  // Block backslash which some browsers normalize to forward slash
  if (path.includes('\\')) return '/';

  // Block URLs with @ which could be userinfo (user@evil.com)
  if (path.includes('@')) return '/';

  return path;
}

/**
 * Validate that a URL is safe for redirect within the application.
 * For use with full URLs (not just paths).
 *
 * @param url - Full URL to validate
 * @param allowedOrigin - The allowed origin for redirects
 * @returns Whether the URL is safe to redirect to
 */
export function isValidRedirectUrl(url: string, allowedOrigin: string): boolean {
  try {
    const parsed = new URL(url);
    const allowed = new URL(allowedOrigin);
    return parsed.origin === allowed.origin;
  } catch {
    return false;
  }
}
