export const DEFAULT_VAT_PERCENT = 27
/** @deprecated Use DEFAULT_VAT_PERCENT */
export const VAT_PERCENT = DEFAULT_VAT_PERCENT
/** @deprecated Use vatRateFromPercent */
export const VAT_RATE = DEFAULT_VAT_PERCENT / 100

export function clampVatPercent(percent: unknown): number {
  const n = Number(percent)
  if (!Number.isFinite(n) || n < 0) return DEFAULT_VAT_PERCENT
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function vatRateFromPercent(percent: unknown): number {
  return clampVatPercent(percent) / 100
}

export function roundHuf(value: number): number {
  return Math.round(Number(value || 0))
}

export function netToGross(netPrice: number, vatPercent?: number): number {
  const r = vatRateFromPercent(vatPercent ?? DEFAULT_VAT_PERCENT)
  return roundHuf(Number(netPrice || 0) * (1 + r))
}

export function grossToNet(grossPrice: number, vatPercent?: number): number {
  const r = vatRateFromPercent(vatPercent ?? DEFAULT_VAT_PERCENT)
  const denom = 1 + r
  if (denom <= 0) return roundHuf(Number(grossPrice || 0))
  return roundHuf(Number(grossPrice || 0) / denom)
}

export function grossFromNetWithDiscount(netPrice: number, discount = 0, vatPercent?: number): number {
  const r = vatRateFromPercent(vatPercent ?? DEFAULT_VAT_PERCENT)
  const gross = Number(netPrice || 0) * (1 + r)
  return roundHuf(gross * (1 - Number(discount || 0) / 100))
}

export function netFromGrossWithDiscount(grossPrice: number, vatPercent?: number): number {
  return grossToNet(grossPrice, vatPercent)
}

export function priceBreakdownFromGross(grossPrice: number, quantity = 1, vatPercent?: number) {
  const pct = clampVatPercent(vatPercent ?? DEFAULT_VAT_PERCENT)
  const unitGross = roundHuf(grossPrice)
  const unitNet = grossToNet(unitGross, pct)
  const unitVat = unitGross - unitNet
  const qty = Number(quantity || 0)

  return {
    unitNet,
    unitVat,
    unitGross,
    lineNet: roundHuf(unitNet * qty),
    lineVat: roundHuf(unitVat * qty),
    lineGross: roundHuf(unitGross * qty),
    vatPercent: pct,
  }
}

export function totalsBreakdownFromGross(grossTotal: number, vatPercent?: number) {
  const pct = clampVatPercent(vatPercent ?? DEFAULT_VAT_PERCENT)
  const gross = roundHuf(grossTotal)
  const net = grossToNet(gross, pct)
  return {
    net,
    vat: gross - net,
    gross,
    vatPercent: pct,
  }
}

/** Sum lines that may carry different VAT rates (mixed cart). */
export function totalsFromMixedVatLines(
  lines: Array<{ grossUnit: number; quantity: number; vatPercent?: number }>
) {
  let net = 0
  let vat = 0
  let gross = 0
  for (const line of lines) {
    const bd = priceBreakdownFromGross(line.grossUnit, line.quantity, line.vatPercent)
    net += bd.lineNet
    vat += bd.lineVat
    gross += bd.lineGross
  }
  return {
    net: roundHuf(net),
    vat: roundHuf(vat),
    gross: roundHuf(gross),
  }
}

/**
 * Net / VAT split for a completed order: goods lines use stored per-line `vatPercent` and post-discount
 * gross is inferred the same way as checkout (scale line gross by `total - fees` vs `subtotal`).
 * Shipping and payment fee lines use the standard shop rate (27%).
 */
export function totalsBreakdownForOrderSnapshot(order: {
  items: Array<{ price: number; quantity: number; vatPercent?: number }>
  subtotal: number
  shippingFee: number
  paymentFee: number
  total: number
}) {
  const st = roundHuf(Number(order.subtotal ?? 0))
  const sf = roundHuf(Number(order.shippingFee ?? 0))
  const pf = roundHuf(Number(order.paymentFee ?? 0))
  const ttl = roundHuf(Number(order.total ?? 0))
  const goodsAfterDiscount = Math.max(0, ttl - sf - pf)
  const scale = st > 0 ? goodsAfterDiscount / st : 1
  const mixed = totalsFromMixedVatLines(
    order.items.map((i) => ({
      grossUnit: roundHuf(Number(i.price) * scale),
      quantity: Number(i.quantity) || 0,
      vatPercent: clampVatPercent(i.vatPercent ?? DEFAULT_VAT_PERCENT),
    }))
  )
  let net = mixed.net
  let vat = mixed.vat
  if (sf > 0) {
    const s = priceBreakdownFromGross(sf, 1, DEFAULT_VAT_PERCENT)
    net += s.lineNet
    vat += s.lineVat
  }
  if (pf > 0) {
    const p = priceBreakdownFromGross(pf, 1, DEFAULT_VAT_PERCENT)
    net += p.lineNet
    vat += p.lineVat
  }
  return {
    net: roundHuf(net),
    vat: roundHuf(vat),
    gross: ttl,
  }
}

export function formatHuf(value: number): string {
  return `${roundHuf(value).toLocaleString("hu-HU")} FT`
}
