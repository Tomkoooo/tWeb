import { describe, expect, it } from "vitest"
import { getEffectiveThemeBase } from "@/services/theme"
import { keramiaDentalTheme } from "@/templates/keramia-shared/theme"
import { loadTemplateModule } from "@/templates/registry"

describe("theme template scope", () => {
  it("keramia templates ship curated defaultTheme baseline", async () => {
    const fog = await loadTemplateModule("keramia-fogfeherites")
    const implant = await loadTemplateModule("keramia-implant")
    expect(getEffectiveThemeBase(fog)).toEqual(keramiaDentalTheme)
    expect(getEffectiveThemeBase(implant)).toEqual(keramiaDentalTheme)
  })
})
