import { describe, expect, it } from "vitest";
import { formatOrderNumber, formatOrderNumberLabel } from "@/lib/order-number";
import {
  grossFromNetWithDiscount,
  grossToNet,
  netToGross,
  priceBreakdownFromGross,
  totalsBreakdownFromGross,
} from "@/lib/pricing";

describe("order number helpers", () => {
  it("formats display order numbers from Mongo ids", () => {
    expect(formatOrderNumber("69fda698f300b22d8450b638")).toBe("50B638");
    expect(formatOrderNumberLabel("69fda698f300b22d8450b638")).toBe("#50B638");
  });
});

describe("pricing helpers", () => {
  it("converts between net and gross HUF values with 27% VAT", () => {
    expect(netToGross(1200)).toBe(1524);
    expect(grossToNet(1524)).toBe(1200);
  });

  it("matches checkout gross-after-discount calculation", () => {
    expect(grossFromNetWithDiscount(1200, 10)).toBe(1372);
  });

  it("returns line and total VAT breakdowns", () => {
    expect(priceBreakdownFromGross(1524, 2)).toMatchObject({
      unitNet: 1200,
      unitVat: 324,
      unitGross: 1524,
      lineNet: 2400,
      lineVat: 648,
      lineGross: 3048,
      vatPercent: 27,
    });
    expect(totalsBreakdownFromGross(1524)).toMatchObject({
      net: 1200,
      vat: 324,
      gross: 1524,
      vatPercent: 27,
    });
  });
});
