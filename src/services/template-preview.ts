import { cookies } from "next/headers"
import { TEMPLATE_REGISTRY } from "@/templates/registry"

export const TEMPLATE_PREVIEW_COOKIE = "wse_template_preview"

/**
 * Returns the previewed template id from the cookie if (and only if) it
 * resolves to a known template. The middleware enforces that this cookie
 * is only set for ADMIN sessions.
 */
export async function readPreviewTemplateId(): Promise<string | null> {
  try {
    const store = await cookies()
    const value = store.get(TEMPLATE_PREVIEW_COOKIE)?.value
    if (!value) return null
    if (!TEMPLATE_REGISTRY[value]) return null
    return value
  } catch {
    return null
  }
}
