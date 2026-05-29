import { describe, expect, it } from "vitest"
import { calculateCampTotalHuf, seatsRequiredForBooking } from "@/plugins/camp-booking/lib/pricing"
import { buildCampRegistrationExportRows } from "@/plugins/camp-booking/lib/camp-registration-export"

describe("camp-booking pricing", () => {
  it("per_child multiplies by child count", () => {
    expect(calculateCampTotalHuf(89000, "per_child", 2)).toBe(178000)
  })

  it("flat ignores child count beyond minimum seat", () => {
    expect(calculateCampTotalHuf(25000, "flat", 3)).toBe(25000)
  })

  it("seats required equals child count", () => {
    expect(seatsRequiredForBooking(3)).toBe(3)
  })
})

describe("camp registration export", () => {
  it("emits one row per child with buyer columns", () => {
    const rows = buildCampRegistrationExportRows([
      {
        buyerName: "Kovács Anna",
        buyerEmail: "anna@example.com",
        buyerPhone: "+36123456789",
        sessionLabel: "I. turnus",
        ticketTypeName: "Teljes turnus",
        totalHuf: 178000,
        childCount: 2,
        paidAt: new Date("2026-05-01"),
        children: [
          { name: "Bence", birthDate: "2015-03-01", dietaryRequest: "", allergies: "mogyoró" },
          { name: "Lili", birthDate: "2017-08-12", dietaryRequest: "vegetáriánus", allergies: "" },
        ],
      } as never,
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0]["Vásárló neve"]).toBe("Kovács Anna")
    expect(rows[0]["Gyerek neve"]).toBe("Bence")
    expect(rows[1]["Gyerek neve"]).toBe("Lili")
    expect(rows[0].Turnus).toBe("I. turnus")
  })
})
