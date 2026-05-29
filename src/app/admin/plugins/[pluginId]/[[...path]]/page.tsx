import { notFound } from "next/navigation"
import { PluginService } from "@/services/plugin"
import { getPluginById } from "@/plugins/registry"

type PageProps = {
  params: Promise<{ pluginId: string; path?: string[] }>
}

export default async function AdminPluginScreenPage({ params }: PageProps) {
  const { pluginId, path: pathSegments } = await params
  const path = pathSegments ?? []

  const enabled = await PluginService.isEnabled(pluginId)
  if (!enabled) notFound()

  const plugin = getPluginById(pluginId)
  if (!plugin?.admin?.Screen) notFound()

  const config = await PluginService.getConfig(pluginId)
  const Screen = plugin.admin.Screen

  return <Screen path={path} config={config} />
}
