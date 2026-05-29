import { definePlugin } from "@/plugins/types"
import { CampBookingAdminScreen } from "./admin/CampBookingAdminScreen"
import { handleCampBookingApi } from "./api/handlers"

export const campBooking = definePlugin({
  manifest: {
    id: "camp-booking",
    name: "Tábor foglalás",
    version: "1.0.0",
    description: "Minecraft tábor turnus foglalás, közvetlen Stripe fizetés, Excel export.",
    requiresShop: false,
    featureFlagKey: "pluginCampBooking",
  },
  admin: {
    navItems: [
      { label: "Áttekintés", segment: "" },
      { label: "Táborok", segment: "camps" },
      { label: "Régisztrációk", segment: "registrations" },
    ],
    Screen: CampBookingAdminScreen,
  },
  api: {
    handle: handleCampBookingApi,
  },
})
