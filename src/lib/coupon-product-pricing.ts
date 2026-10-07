import { clampVatPercent, netToGross, roundHuf } from "@/lib/pricing";
import type { CouponProductPriceMode } from "@/models/Coupon";

export function couponProductRuleKey(product: string, variantId?: string | null): string {
  return `${String(product)}:${variantId?.trim() || ""}`;
}

export type CouponProductPriceConditionInput = {
  product: string;
  variantId?: string | null;
  /** Required quantity of the condition product in the cart. Defaults to 1. */
  minQuantity?: number;
};

export type CouponProductPriceRuleInput = {
  product: string;
  variantId?: string | null;
  mode: CouponProductPriceMode | string;
  value: number;
  /**
   * The rule only applies when every listed product is also in the cart.
   * Empty / missing means the rule is unconditional.
   */
  requiresProducts?: CouponProductPriceConditionInput[] | null;
};

export function findProductPriceRule(
  rules: CouponProductPriceRuleInput[] | undefined,
  productId: string,
  variantId?: string | null
): CouponProductPriceRuleInput | null {
  if (!Array.isArray(rules) || rules.length === 0) return null;

  const forProduct = rules.filter((rule) => String(rule.product) === String(productId));
  if (forProduct.length === 0) return null;

  const variantKey = variantId?.trim() || "";
  if (variantKey) {
    const exact = forProduct.find((rule) => rule.variantId?.trim() === variantKey);
    if (exact) return exact;
  }

  return forProduct.find((rule) => !rule.variantId?.trim()) ?? null;
}

export function cartQuantityForCondition(
  lines: CheckoutLineForCoupon[],
  condition: Pick<CouponProductPriceConditionInput, "product" | "variantId">
): number {
  const variantKey = condition.variantId?.trim() || "";
  return lines.reduce((sum, line) => {
    if (String(line.product) !== String(condition.product)) return sum;
    if (variantKey && (line.variantId?.trim() || "") !== variantKey) return sum;
    return sum + Math.max(0, Number(line.quantity || 0));
  }, 0);
}

export function isRuleEligibleForCart(
  rule: Pick<CouponProductPriceRuleInput, "requiresProducts">,
  lines: CheckoutLineForCoupon[]
): boolean {
  const conditions = Array.isArray(rule.requiresProducts) ? rule.requiresProducts : [];
  if (conditions.length === 0) return true;

  return conditions.every((condition) => {
    if (!condition?.product) return true;
    const needed = Math.max(1, Math.floor(Number(condition.minQuantity || 1)));
    return cartQuantityForCondition(lines, condition) >= needed;
  });
}

export function filterEligibleProductPriceRules(
  rules: CouponProductPriceRuleInput[] | undefined,
  lines: CheckoutLineForCoupon[]
): CouponProductPriceRuleInput[] {
  if (!Array.isArray(rules)) return [];
  return rules.filter((rule) => isRuleEligibleForCart(rule, lines));
}

export function computeCouponUnitGross(
  baseUnitGross: number,
  vatPercent: number,
  rule: Pick<CouponProductPriceRuleInput, "mode" | "value">
): number {
  const pct = clampVatPercent(vatPercent);
  const value = Number(rule.value || 0);

  if (rule.mode === "percentage") {
    const factor = Math.max(0, Math.min(100, value)) / 100;
    return roundHuf(Math.max(0, baseUnitGross * (1 - factor)));
  }
  if (rule.mode === "fixed_gross") {
    return roundHuf(Math.max(0, value));
  }
  if (rule.mode === "fixed_net") {
    return roundHuf(Math.max(0, netToGross(value, pct)));
  }
  return roundHuf(baseUnitGross);
}

export type CheckoutLineForCoupon = {
  product: string;
  variantId?: string;
  quantity: number;
  price: number;
  vatPercent?: number;
};

export function applyProductPriceRulesToLines<T extends CheckoutLineForCoupon>(
  lines: T[],
  rules: CouponProductPriceRuleInput[] | undefined
): {
  lines: T[];
  adjustedSubtotal: number;
  matchedLineCount: number;
  /** Indexes of `lines` an eligible rule was applied to (order preserved). */
  appliedLineIndexes: number[];
  /** Rules whose cart conditions are satisfied. */
  eligibleRules: CouponProductPriceRuleInput[];
} {
  const plainSubtotal = () =>
    roundHuf(
      lines.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 0), 0)
    );

  if (!Array.isArray(rules) || rules.length === 0) {
    return {
      lines,
      adjustedSubtotal: plainSubtotal(),
      matchedLineCount: 0,
      appliedLineIndexes: [],
      eligibleRules: [],
    };
  }

  const eligibleRules = filterEligibleProductPriceRules(rules, lines);
  if (eligibleRules.length === 0) {
    return {
      lines,
      adjustedSubtotal: plainSubtotal(),
      matchedLineCount: 0,
      appliedLineIndexes: [],
      eligibleRules,
    };
  }

  const appliedLineIndexes: number[] = [];
  const nextLines = lines.map((line, index) => {
    const rule = findProductPriceRule(eligibleRules, line.product, line.variantId);
    if (!rule) return line;

    appliedLineIndexes.push(index);
    const unitGross = computeCouponUnitGross(
      Number(line.price || 0),
      line.vatPercent ?? 27,
      rule
    );
    return { ...line, price: unitGross };
  });

  const adjustedSubtotal = roundHuf(
    nextLines.reduce((sum, line) => sum + Number(line.price || 0) * Number(line.quantity || 0), 0)
  );

  return {
    lines: nextLines,
    adjustedSubtotal,
    matchedLineCount: appliedLineIndexes.length,
    appliedLineIndexes,
    eligibleRules,
  };
}
