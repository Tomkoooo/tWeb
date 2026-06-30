import { createKeramiaLandingTemplate } from "@/templates/keramia-shared/createKeramiaLandingTemplate"
import { fogfeheritesDefault } from "@/templates/keramia-shared/static-pages/shared/defaults/fogfeherites"

export const keramiaFogfeherites = createKeramiaLandingTemplate({
  id: "keramia-fogfeherites",
  name: "Kerámia Dental — Fogfehérítés",
  description:
    "Nyári fogfehérítés + fogkőleszedés landing oldal kapcsolatfelvételi űrlappal (aldomain).",
  screenshot: "/template-previews/keramia-fogfeherites.svg",
  defaultContent: fogfeheritesDefault,
})
