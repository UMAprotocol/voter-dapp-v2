const logged = new Set<string>();

/**
 * console.warn that fires once per key per session. Data-fetching code paths
 * run per-item and on refetch intervals, so a single unhealthy endpoint can
 * otherwise flood the console with hundreds of identical messages.
 */
export function warnOnce(key: string, message: string, details?: unknown) {
  if (logged.has(key)) return;
  logged.add(key);
  if (details !== undefined) {
    console.warn(message, details);
  } else {
    console.warn(message);
  }
}

/** console.error variant of warnOnce. */
export function errorOnce(key: string, message: string, details?: unknown) {
  if (logged.has(key)) return;
  logged.add(key);
  if (details !== undefined) {
    console.error(message, details);
  } else {
    console.error(message);
  }
}
