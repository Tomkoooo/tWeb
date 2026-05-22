import { describe, expect, it } from "vitest"
import {
  formatGlsParcelPointLines,
  formatFoxpostParcelPointLines,
  foxpostParcelPointFindmeHtml,
} from "@/lib/parcel-locker-checkout-display"

describe("parcel locker checkout display", () => {
  it("formats GLS point lines", () => {
    expect(
      formatGlsParcelPointLines({
        id: "1",
        name: "GLS Pont",
        contact: { postalCode: "1011", city: "Budapest", address: "Utca 1" },
      })
    ).toEqual(["GLS Pont", "1011 Budapest Utca 1"])
  })

  it("formats Foxpost point lines without findme (HTML shown separately)", () => {
    expect(
      formatFoxpostParcelPointLines({
        id: "2",
        name: "Foxpost A",
        zip: "4024",
        city: "Debrecen",
        address: "Main 2",
        findme: "Bejárat mögött",
      })
    ).toEqual(["Foxpost A", "4024 Debrecen Main 2"])
  })

  it("exposes Foxpost findme HTML", () => {
    expect(
      foxpostParcelPointFindmeHtml({
        id: "2",
        name: "Foxpost A",
        findme: "<b>Fizetés</b><br/>Kártya",
      })
    ).toBe("<b>Fizetés</b><br/>Kártya")
  })
})
