import { definePlugin } from "@/plugins/types"
import { TicketingAdminScreen } from "./admin/TicketingAdminScreen"
import { handleTicketingApi } from "./api/handlers"

export const ticketing = definePlugin({
  manifest: {
    id: "ticketing",
    name: "Ticketing",
    version: "0.1.0",
    description: "Course and event ticket sales with direct checkout (no cart).",
    requiresShop: true,
    /** Optional runtime toggle on top of deployment allowlist. */
    featureFlagKey: "pluginTicketing",
  },
  admin: {
    navItems: [
      { label: "Áttekintés", segment: "" },
      { label: "Események", segment: "events" },
    ],
    Screen: TicketingAdminScreen,
  },
  api: {
    handle: handleTicketingApi,
  },
})
