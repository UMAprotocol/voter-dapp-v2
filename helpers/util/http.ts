/**
 * Get the base URL for internal API calls.
 * - Required because server-side fetch() needs absolute URLs
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
 */
export function getBaseUrl(): string {
  // Browser
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
