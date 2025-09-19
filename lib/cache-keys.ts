/**
 * Get the cache key prefix from environment variable
 * Falls back to 'development' if not set
 */
function getCacheKeyPrefix(): string {
  return process.env.VERCEL_ENV || "development";
}

/**
 * Create a prefixed cache key
 * @param key - The base cache key
 * @returns Prefixed cache key
 */
export function createCacheKey(key: string): string {
  const prefix = getCacheKeyPrefix();
  return `${prefix}:${key}`;
}
