import type { TemplateModule } from "./types"
import { defaultModern } from "./default-modern/template.config"
import { atelierShowcase } from "./atelier-showcase/template.config"

export const FALLBACK_TEMPLATE_ID = "default-modern" as const

const syncRegistry: Partial<Record<string, TemplateModule>> = {
  [FALLBACK_TEMPLATE_ID]: defaultModern,
  "atelier-showcase": atelierShowcase,
}

const templateLoaders: Record<string, () => Promise<TemplateModule>> = {
  "atelier-showcase": async () => atelierShowcase,
}

export async function loadTemplateModule(id: string): Promise<TemplateModule> {
  if (syncRegistry[id]) return syncRegistry[id]!
  const loader = templateLoaders[id]
  if (!loader) return syncRegistry[FALLBACK_TEMPLATE_ID]!
  const loaded = await loader()
  syncRegistry[id] = loaded
  return loaded
}

export function getTemplateById(id: string | undefined | null): TemplateModule {
  if (!id) return syncRegistry[FALLBACK_TEMPLATE_ID]!
  return syncRegistry[id] ?? syncRegistry[FALLBACK_TEMPLATE_ID]!
}

export async function getTemplateByIdAsync(id: string | undefined | null): Promise<TemplateModule> {
  if (!id) return syncRegistry[FALLBACK_TEMPLATE_ID]!
  return loadTemplateModule(id)
}

/** Sync registry for admin/scripts; inactive templates may be undefined until `loadTemplateModule`. */
export const TEMPLATE_REGISTRY: Record<string, TemplateModule | undefined> = new Proxy(
  {} as Record<string, TemplateModule | undefined>,
  {
    get(_target, prop: string) {
      if (prop === FALLBACK_TEMPLATE_ID || prop === "default-modern") {
        return syncRegistry[FALLBACK_TEMPLATE_ID]
      }
      return syncRegistry[prop]
    },
    has(_target, prop: string) {
      return prop === FALLBACK_TEMPLATE_ID || prop === "default-modern" || prop in syncRegistry
    },
    ownKeys() {
      return Object.keys(syncRegistry)
    },
  }
)

export function listTemplates(): TemplateModule[] {
  const fallback = syncRegistry[FALLBACK_TEMPLATE_ID]
  return fallback ? [fallback] : []
}

export async function listAllTemplates(): Promise<TemplateModule[]> {
  const ids = [FALLBACK_TEMPLATE_ID, "atelier-showcase"] as const
  return Promise.all(ids.map((id) => loadTemplateModule(id)))
}
