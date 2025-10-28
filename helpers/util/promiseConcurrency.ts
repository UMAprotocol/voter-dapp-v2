const CONCURRENCY_LIMIT = 15;

/**
 * Execute an array of promise factories with limited concurrency.
 * Unlike Promise.all which runs all promises simultaneously,
 * this ensures only `concurrency` promises run at once.
 *
 * @param promiseFactories - Array of functions that return promises (called when ready to execute)
 * @param concurrency - Maximum number of concurrent operations (default: 15)
 * @returns Array of results in the same order as input
 *
 * @example
 * ```typescript
 * const results = await promiseAllWithConcurrency(
 *   items.map(item => () => fetchData(item))
 * );
 * ```
 */
export async function promiseAllWithConcurrency<R>(
  promiseFactories: Array<() => Promise<R>>,
  concurrency = CONCURRENCY_LIMIT
): Promise<R[]> {
  const results: R[] = new Array<R>(promiseFactories.length);
  let currentIndex = 0;

  // Worker function that processes promise factories
  const worker = async (): Promise<void> => {
    while (currentIndex < promiseFactories.length) {
      const index = currentIndex++;
      const factory = promiseFactories[index];
      results[index] = await factory();
    }
  };

  // Create worker pool
  const workers = Array.from(
    { length: Math.min(concurrency, promiseFactories.length) },
    () => worker()
  );

  // Wait for all workers to complete
  await Promise.all(workers);

  return results;
}
