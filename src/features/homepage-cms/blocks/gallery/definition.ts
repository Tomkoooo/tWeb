import type { BlockDefinition } from "@/features/homepage-cms/blocks/types"

export const galleryDefinition: BlockDefinition<"gallery"> = {
  type: "gallery",
  label: "Galéria",
  create: () => ({
    id: `gallery-${Date.now()}`,
    type: "gallery",
    enabled: true,
    data: {
      title: "Galéria",
      items: [
        { image: "/generic-hero.svg", caption: "Első kép" },
        { image: "/generic-logo.svg", caption: "Második kép" },
      ],
    },
  }),
}
