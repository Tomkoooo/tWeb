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

    it("sets one product to a fixed price and makes a second product free when both are in the cart", () => {
      const coupon = makeCoupon({
        type: DiscountType.PRODUCT_PRICE,
        productPriceRules: [
          { product: "a" as never, mode: CouponProductPriceMode.FIXED_GROSS, value: 20000 },
          {
            product: "b" as never,
            mode: CouponProductPriceMode.FIXED_GROSS,
            value: 0,
            requiresProducts: [{ product: "a" as never, minQuantity: 1 }],
          },
        ],
      });

      const result = applyCouponToCart(coupon, 35000, [
        { product: "a", quantity: 1, price: 30000, vatPercent: 27 },
        { product: "b", quantity: 1, price: 5000, vatPercent: 27 },
      ]);

      expect(result.adjustedSubtotal).toBe(20000);
      expect(result.discount).toBe(15000);
      expect(result.adjustedLines?.map((line) => line.price)).toEqual([20000, 0]);
      expect(result.lineAdjustments).toEqual([
        { productId: "a", variantId: undefined, unitGross: 20000, quantity: 1 },
        { productId: "b", variantId: undefined, unitGross: 0, quantity: 1 },
      ]);
    });

    it("skips the conditional rule when the required product is missing but still applies the others", () => {
      const coupon = makeCoupon({
        type: DiscountType.PRODUCT_PRICE,
        productPriceRules: [
          { product: "a" as never, mode: CouponProductPriceMode.FIXED_GROSS, value: 20000 },
          {
            product: "b" as never,
            mode: CouponProductPriceMode.FIXED_GROSS,
            value: 0,
            requiresProducts: [{ product: "zzz" as never }],
          },
        ],
      });

      const result = applyCouponToCart(coupon, 35000, [
        { product: "a", quantity: 1, price: 30000, vatPercent: 27 },
        { product: "b", quantity: 1, price: 5000, vatPercent: 27 },
      ]);

      expect(result.adjustedSubtotal).toBe(25000);
      expect(result.discount).toBe(10000);
      expect(result.lineAdjustments).toEqual([
        { productId: "a", variantId: undefined, unitGross: 20000, quantity: 1 },
      ]);
    });

    it("rejects the coupon when every rule is gated behind a product missing from the cart", () => {
      const coupon = makeCoupon({
        type: DiscountType.PRODUCT_PRICE,
        productPriceRules: [
          {
            product: "b" as never,
            mode: CouponProductPriceMode.FIXED_GROSS,
            value: 0,
            requiresProducts: [{ product: "a" as never }],
          },
        ],
      });

      expect(() =>
        applyCouponToCart(coupon, 5000, [{ product: "b", quantity: 1, price: 5000, vatPercent: 27 }])
      ).toThrow(/feltételei nem teljesülnek/);
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

    it("keeps per-rule cart conditions, normalizes minQuantity and dedupes them", () => {
      const payload = normalizeCouponPayload({
        ...baseData,
        type: "product_price",
        productPriceRules: [
          { product: "507f1f77bcf86cd799439011", mode: "fixed_gross", value: 20000 },
          {
            product: "507f1f77bcf86cd799439012",
            mode: "fixed_gross",
            value: 0,
            requiresProducts: [
              { product: "507f1f77bcf86cd799439011", minQuantity: 0 },
              { product: "507f1f77bcf86cd799439011", minQuantity: 5 },
              { product: "not-an-object-id", minQuantity: 2 },
            ],
          },
        ],
      });

      const rules = payload.productPriceRules!;
      expect(rules).toHaveLength(2);
      expect(rules[0].requiresProducts).toEqual([]);
      expect(rules[1].requiresProducts).toHaveLength(1);
      expect(String(rules[1].requiresProducts![0].product)).toBe("507f1f77bcf86cd799439011");
      expect(rules[1].requiresProducts![0].minQuantity).toBe(1);
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
