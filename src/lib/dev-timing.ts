/**
 * Lightweight async timing for storefront cold-path debugging (development only).
 */
export async function timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV !== "development") {
    return fn()
  }
  const start = performance.now()
  try {
    return await fn()
  } finally {
    const ms = Math.round(performance.now() - start)
    console.info(`[storefront-timing] ${label}: ${ms}ms`)
  }
}
