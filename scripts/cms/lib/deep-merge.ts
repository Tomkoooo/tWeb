/**
 * Plain-object deep merge for CMS import patches (arrays are replaced, not concatenated).
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>
): T {
  const out = { ...base } as Record<string, unknown>
  for (const [key, patchVal] of Object.entries(patch)) {
    const baseVal = out[key]
    if (
      patchVal !== null &&
      typeof patchVal === "object" &&
      !Array.isArray(patchVal) &&
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      out[key] = deepMerge(
        baseVal as Record<string, unknown>,
        patchVal as Record<string, unknown>
      )
    } else if (patchVal !== undefined) {
      out[key] = patchVal
    }
  }
  return out as T
}
