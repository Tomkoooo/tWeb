import { describe, expect, it } from "vitest";
import {
  applyNumberedDescriptionTemplate,
  resolveVariantDescription,
} from "@/lib/unique-numbered-variants";

describe("numbered variant description", () => {
  it("applyNumberedDescriptionTemplate replaces tokens", () => {
    expect(
      applyNumberedDescriptionTemplate("Példány: {{number}}", { Szám: "42" }, "Szám")
    ).toBe("Példány: 42");
    expect(applyNumberedDescriptionTemplate("Nr. {{szam}}", { Szám: "7" })).toBe("Nr. 7");
  });

  it("resolveVariantDescription prefers per-variant override", () => {
    const product = {
      description: "Alap",
      uniqueNumberedVariants: {
        enabled: true,
        attributeName: "Szám",
        maxQuantityPerLine: 1,
        descriptionHtml: "Sorszám: {{number}}",
      },
    };
    expect(
      resolveVariantDescription(product, {
        descriptionOverride: "Egyedi",
        attributes: { Szám: "10" },
      })
    ).toBe("Egyedi");
  });

  it("resolveVariantDescription uses numbered template when no per-variant override", () => {
    const product = {
      description: "Alap",
      uniqueNumberedVariants: {
        enabled: true,
        attributeName: "Szám",
        maxQuantityPerLine: 1,
        descriptionHtml: "Limitált #{{number}}",
      },
    };
    expect(
      resolveVariantDescription(product, {
        attributes: { Szám: "36" },
      })
    ).toBe("Limitált #36");
  });

  it("resolveVariantDescription falls back to product description", () => {
    expect(
      resolveVariantDescription(
        { description: "Alap", uniqueNumberedVariants: { enabled: true, attributeName: "Szám", maxQuantityPerLine: 1 } },
        { attributes: { Szám: "1" } }
      )
    ).toBe("Alap");
  });

  it("resolveVariantDescription without variant returns product description", () => {
    expect(resolveVariantDescription({ description: "Alap" }, null)).toBe("Alap");
  });
});
