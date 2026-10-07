import { describe, expect, it } from "vitest";
import {
  applyProductPriceRulesToLines,
  cartQuantityForCondition,
  computeCouponUnitGross,
  couponProductRuleKey,
  filterEligibleProductPriceRules,
  findProductPriceRule,
  isRuleEligibleForCart,
} from "@/lib/coupon-product-pricing";

describe("coupon-product-pricing", () => {
  it("builds stable rule keys for product + variant combinations", () => {
    expect(couponProductRuleKey("p1")).toBe("p1:");
    expect(couponProductRuleKey("p1", "v1")).toBe("p1:v1");
    expect(couponProductRuleKey("p1", "  ")).toBe("p1:");
  });

  const rules = [
    { product: "p1", mode: "percentage" as const, value: 10 },
    { product: "p2", variantId: "v2", mode: "fixed_gross" as const, value: 5000 },
    { product: "p3", mode: "fixed_net" as const, value: 1000 },
  ];

  it("finds variant-specific rule before product-wide rule", () => {
    const allVariants = findProductPriceRule(
      [
        { product: "p1", mode: "percentage", value: 5 },
        { product: "p1", variantId: "v1", mode: "fixed_gross", value: 9000 },
      ],
      "p1",
      "v1"
    );
    expect(allVariants?.mode).toBe("fixed_gross");
    expect(allVariants?.value).toBe(9000);

    const fallback = findProductPriceRule(
      [
        { product: "p1", mode: "percentage", value: 5 },
        { product: "p1", variantId: "v1", mode: "fixed_gross", value: 9000 },
      ],
      "p1",
      "v9"
    );
    expect(fallback?.mode).toBe("percentage");
  });

  it("computes percentage, fixed gross, and fixed net unit prices", () => {
    expect(computeCouponUnitGross(10000, 27, { mode: "percentage", value: 10 })).toBe(9000);
    expect(computeCouponUnitGross(10000, 27, { mode: "fixed_gross", value: 7500 })).toBe(7500);
    expect(computeCouponUnitGross(10000, 27, { mode: "fixed_net", value: 1000 })).toBe(1270);
  });

  it("applies rules to matching cart lines only", () => {
    const lines = [
      { product: "p1", quantity: 2, price: 10000, vatPercent: 27 },
      { product: "p2", variantId: "v1", quantity: 1, price: 8000, vatPercent: 27 },
      { product: "p2", variantId: "v2", quantity: 1, price: 8000, vatPercent: 27 },
      { product: "p9", quantity: 1, price: 3000, vatPercent: 27 },
    ];

    const applied = applyProductPriceRulesToLines(lines, rules);
    expect(applied.matchedLineCount).toBe(2);
    expect(applied.lines[0].price).toBe(9000);
    expect(applied.lines[1].price).toBe(8000);
    expect(applied.lines[2].price).toBe(5000);
    expect(applied.lines[3].price).toBe(3000);
    expect(applied.adjustedSubtotal).toBe(9000 * 2 + 8000 + 5000 + 3000);
  });

  describe("conditional rules (requiresProducts)", () => {
    it("counts condition quantity across matching lines and respects the variant filter", () => {
      const lines = [
        { product: "a", variantId: "v1", quantity: 2, price: 1000 },
        { product: "a", variantId: "v2", quantity: 3, price: 1000 },
        { product: "b", quantity: 1, price: 1000 },
      ];
      expect(cartQuantityForCondition(lines, { product: "a" })).toBe(5);
      expect(cartQuantityForCondition(lines, { product: "a", variantId: "v2" })).toBe(3);
      expect(cartQuantityForCondition(lines, { product: "zzz" })).toBe(0);
    });

    it("treats a rule without conditions as always eligible", () => {
      expect(isRuleEligibleForCart({}, [])).toBe(true);
      expect(isRuleEligibleForCart({ requiresProducts: [] }, [])).toBe(true);
    });

    it("requires every condition to be satisfied", () => {
      const rule = {
        requiresProducts: [
          { product: "a", minQuantity: 2 },
          { product: "b" },
        ],
      };
      expect(
        isRuleEligibleForCart(rule, [
          { product: "a", quantity: 2, price: 100 },
          { product: "b", quantity: 1, price: 100 },
        ])
      ).toBe(true);
      expect(
        isRuleEligibleForCart(rule, [
          { product: "a", quantity: 1, price: 100 },
          { product: "b", quantity: 1, price: 100 },
        ])
      ).toBe(false);
      expect(isRuleEligibleForCart(rule, [{ product: "a", quantity: 5, price: 100 }])).toBe(false);
    });

    it("filters out ineligible rules only", () => {
      const rules = [
        { product: "a", mode: "fixed_gross" as const, value: 20000 },
        { product: "b", mode: "fixed_gross" as const, value: 0, requiresProducts: [{ product: "a" }] },
      ];
      expect(filterEligibleProductPriceRules(rules, [{ product: "b", quantity: 1, price: 5000 }])).toHaveLength(1);
      expect(
        filterEligibleProductPriceRules(rules, [
          { product: "a", quantity: 1, price: 30000 },
          { product: "b", quantity: 1, price: 5000 },
        ])
      ).toHaveLength(2);
    });

    it("sets product A to a fixed price and makes product B free when both are in the cart", () => {
      const rules = [
        { product: "a", mode: "fixed_gross" as const, value: 20000 },
        {
          product: "b",
          mode: "fixed_gross" as const,
          value: 0,
          requiresProducts: [{ product: "a", minQuantity: 1 }],
        },
      ];
      const lines = [
        { product: "a", quantity: 1, price: 30000, vatPercent: 27 },
        { product: "b", quantity: 1, price: 5000, vatPercent: 27 },
      ];

      const applied = applyProductPriceRulesToLines(lines, rules);
      expect(applied.matchedLineCount).toBe(2);
      expect(applied.appliedLineIndexes).toEqual([0, 1]);
      expect(applied.lines[0].price).toBe(20000);
      expect(applied.lines[1].price).toBe(0);
      expect(applied.adjustedSubtotal).toBe(20000);
    });

    it("leaves the conditional line at full price when the required product is missing", () => {
      const rules = [
        { product: "a", mode: "fixed_gross" as const, value: 20000 },
        {
          product: "b",
          mode: "fixed_gross" as const,
          value: 0,
          requiresProducts: [{ product: "a" }],
        },
      ];
      const lines = [{ product: "b", quantity: 2, price: 5000, vatPercent: 27 }];

      const applied = applyProductPriceRulesToLines(lines, rules);
      expect(applied.matchedLineCount).toBe(0);
      expect(applied.appliedLineIndexes).toEqual([]);
      expect(applied.lines[0].price).toBe(5000);
      expect(applied.adjustedSubtotal).toBe(10000);
    });

    it("keeps the cart untouched when no rule is eligible", () => {
      const rules = [
        {
          product: "b",
          mode: "fixed_gross" as const,
          value: 0,
          requiresProducts: [{ product: "a" }],
        },
      ];
      const lines = [{ product: "b", quantity: 1, price: 5000, vatPercent: 27 }];

      const applied = applyProductPriceRulesToLines(lines, rules);
      expect(applied.eligibleRules).toHaveLength(0);
      expect(applied.lines[0].price).toBe(5000);
      expect(applied.adjustedSubtotal).toBe(5000);
    });

    it("ignores an ineligible variant-specific rule and falls back to the product-wide rule", () => {
      const rules = [
        { product: "p1", mode: "percentage" as const, value: 10 },
        {
          product: "p1",
          variantId: "v1",
          mode: "fixed_gross" as const,
          value: 0,
          requiresProducts: [{ product: "gift" }],
        },
      ];
      const lines = [{ product: "p1", variantId: "v1", quantity: 1, price: 10000, vatPercent: 27 }];

      const withoutGift = applyProductPriceRulesToLines(lines, rules);
      expect(withoutGift.lines[0].price).toBe(9000);

      const withGift = applyProductPriceRulesToLines(
        [...lines, { product: "gift", quantity: 1, price: 1000, vatPercent: 27 }],
        rules
      );
      expect(withGift.lines[0].price).toBe(0);
    });

    it("supports a buy-N-of-the-same-product condition", () => {
      const rules = [
        {
          product: "a",
          mode: "percentage" as const,
          value: 50,
          requiresProducts: [{ product: "a", minQuantity: 3 }],
        },
      ];
      expect(
        applyProductPriceRulesToLines([{ product: "a", quantity: 2, price: 1000 }], rules).lines[0].price
      ).toBe(1000);
      expect(
        applyProductPriceRulesToLines([{ product: "a", quantity: 3, price: 1000 }], rules).lines[0].price
      ).toBe(500);
    });
  });
});
