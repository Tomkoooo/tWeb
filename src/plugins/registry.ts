import type { PluginModule } from "./types"
import { ticketing } from "./ticketing/plugin.config"
import { campBooking } from "./camp-booking/plugin.config"
export type PluginRegistryEntry = {
  id: string
  module: PluginModule
}

const syncRegistry: Record<string, PluginModule> = {
  ticketing,
  "camp-booking": campBooking,
}

const pluginLoaders: Record<string, () => Promise<PluginModule>> = {
  ticketing: async () => ticketing,
  "camp-booking": async () => campBooking,
}

export function listRegisteredPluginIds(): string[] {
  return Object.keys(syncRegistry)
}

export async function loadPluginModule(id: string): Promise<PluginModule> {
  if (syncRegistry[id]) return syncRegistry[id]
  const loader = pluginLoaders[id]
  if (!loader) {
    throw new Error(`Unknown plugin id '${id}'. Register it in src/plugins/registry.ts.`)
  }
  const loaded = await loader()
  syncRegistry[id] = loaded
  return loaded
}

export function getPluginById(id: string): PluginModule | undefined {
  return syncRegistry[id]
}

export function listAllPlugins(): PluginRegistryEntry[] {
  return Object.entries(syncRegistry).map(([id, module]) => ({ id, module }))
}
