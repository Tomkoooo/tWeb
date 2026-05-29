"use client"

import { CampAdminHome } from "./CampAdminHome"
import { CampStatsPanel } from "./CampStatsPanel"
import { CampsAdmin } from "./CampsAdmin"

export function CampBookingAdminScreen({
  path,
}: {
  path: string[]
  config: Record<string, unknown>
}) {
  const segment = path[0] ?? ""

  if (segment === "stats") {
    return <CampStatsPanel />
  }
  if (segment === "camps") {
    return <CampsAdmin path={path.slice(1)} />
  }
  if (segment === "registrations") {
    return (
      <p className="text-neutral-400 text-sm italic">
        Válassz turnust a Táborok menüben az exporthoz.
      </p>
    )
  }

  return <CampAdminHome />
}
