import type { SeoSettings } from "@/services/seo-settings"

export function resolveSitemapBaseUrl(seo: Pick<SeoSettings, "canonicalBaseUrl">): string {
  const raw =
    seo.canonicalBaseUrl?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  return raw.replace(/\/+$/, "")
}

export function absoluteSitemapUrl(baseUrl: string, path: string): string {
  if (path === "/" || path === "") return `${baseUrl}/`
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${normalized}`
}
