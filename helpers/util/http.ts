/**
 * Get the base URL for internal API calls.
 * - Required because server-side fetch() needs absolute URLs
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
