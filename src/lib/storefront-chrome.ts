import { getActiveChrome } from "@/lib/active-chrome"
import { getStorefrontFooterHydrationProps } from "@/lib/storefront-footer-props"

/** Shared chrome + footer SSR props for storefront pages. */
export async function getStorefrontChromeBundle() {
  const [chrome, footerHydration] = await Promise.all([
    getActiveChrome(),
    getStorefrontFooterHydrationProps(),
  ])
  return { chrome, footerHydration }
}
