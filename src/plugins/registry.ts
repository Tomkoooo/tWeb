import type { PluginModule } from "./types"

export type PluginRegistryEntry = {
  id: string
  module: PluginModule
}

const syncRegistry: Record<string, PluginModule> = {}

const pluginLoaders: Record<string, () => Promise<PluginModule>> = {
  ticketing: () => import("./ticketing/plugin.config").then((m) => m.ticketing),
  "camp-booking": () => import("./camp-booking/plugin.config").then((m) => m.campBooking),
}

export function listRegisteredPluginIds(): string[] {
  return Object.keys(pluginLoaders)
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
