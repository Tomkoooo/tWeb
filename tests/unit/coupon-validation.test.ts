import { describe, expect, it } from "vitest";
import { DiscountType, CouponProductPriceMode, type ICoupon } from "@/models/Coupon";
import { applyCouponToCart, normalizeCouponPayload } from "@/lib/coupon-validation";

function makeCoupon(overrides: Partial<ICoupon>): ICoupon {
  return {
    code: "TEST",
    type: DiscountType.PERCENTAGE,
    value: 0,
    freeShipping: false,
    ...overrides,
  } as ICoupon;
}

describe("coupon-validation", () => {
  describe("applyCouponToCart", () => {
    it("keeps shipping paid by default for a product-price coupon", () => {
      const coupon = makeCoupon({
        type: DiscountType.PRODUCT_PRICE,
        productPriceRules: [
          { product: "p1" as never, mode: CouponProductPriceMode.FIXED_GROSS, value: 0 },
        ],
      });
      const result = applyCouponToCart(coupon, 10000, [
        { product: "p1", quantity: 1, price: 10000, vatPercent: 27 },
      ]);
      expect(result.freeShipping).toBe(false);
      expect(result.discount).toBe(10000);
    });

    it("combines a free item (product-price rule) with the independent freeShipping flag", () => {
      const coupon = makeCoupon({
        type: DiscountType.PRODUCT_PRICE,
        freeShipping: true,
        productPriceRules: [
          { product: "p1" as never, mode: CouponProductPriceMode.FIXED_GROSS, value: 0 },
        ],
      });
      const result = applyCouponToCart(coupon, 10000, [
        { product: "p1", quantity: 1, price: 10000, vatPercent: 27 },
      ]);
      expect(result.freeShipping).toBe(true);
      expect(result.discount).toBe(10000);
      expect(result.adjustedSubtotal).toBe(0);
    });

    it("still applies free shipping for the dedicated FREE_SHIPPING type", () => {
      const coupon = makeCoupon({ type: DiscountType.FREE_SHIPPING });
      const result = applyCouponToCart(coupon, 10000, []);
      expect(result.freeShipping).toBe(true);
      expect(result.discount).toBe(0);
    });
  });

  describe("normalizeCouponPayload", () => {
    const baseData = {
      code: "combo",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    };

    it("persists an explicit freeShipping flag for a product_price coupon", () => {
      const payload = normalizeCouponPayload({
        ...baseData,
        type: "product_price",
        freeShipping: true,
        productPriceRules: [
          { product: "507f1f77bcf86cd799439011", mode: "fixed_gross", value: 0 },
        ],
      });
      expect(payload.type).toBe(DiscountType.PRODUCT_PRICE);
      expect(payload.freeShipping).toBe(true);
    });

    it("defaults freeShipping to false when not provided", () => {
      const payload = normalizeCouponPayload({
        ...baseData,
        type: "percentage",
        value: 10,
      });
      expect(payload.freeShipping).toBe(false);
    });

    it("forces freeShipping true for the free_shipping type regardless of input", () => {
      const payload = normalizeCouponPayload({
        ...baseData,
        type: "free_shipping",
        freeShipping: false,
      });
      expect(payload.freeShipping).toBe(true);
    });
  });
});
