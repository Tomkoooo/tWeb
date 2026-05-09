export const VAT_RATE = 0.27;
export const VAT_PERCENT = 27;

export function roundHuf(value: number): number {
  return Math.round(Number(value || 0));
}

export function netToGross(netPrice: number): number {
  return roundHuf(Number(netPrice || 0) * (1 + VAT_RATE));
}

export function grossToNet(grossPrice: number): number {
  return roundHuf(Number(grossPrice || 0) / (1 + VAT_RATE));
}

export function grossFromNetWithDiscount(netPrice: number, discount = 0): number {
  const gross = Number(netPrice || 0) * (1 + VAT_RATE);
  return roundHuf(gross * (1 - Number(discount || 0) / 100));
}

export function netFromGrossWithDiscount(grossPrice: number): number {
  return grossToNet(grossPrice);
}

export function priceBreakdownFromGross(grossPrice: number, quantity = 1) {
  const unitGross = roundHuf(grossPrice);
  const unitNet = grossToNet(unitGross);
  const unitVat = unitGross - unitNet;
  const qty = Number(quantity || 0);

  return {
    unitNet,
    unitVat,
    unitGross,
    lineNet: roundHuf(unitNet * qty),
    lineVat: roundHuf(unitVat * qty),
    lineGross: roundHuf(unitGross * qty),
    vatPercent: VAT_PERCENT,
  };
}

export function totalsBreakdownFromGross(grossTotal: number) {
  const gross = roundHuf(grossTotal);
  const net = grossToNet(gross);
  return {
    net,
    vat: gross - net,
    gross,
    vatPercent: VAT_PERCENT,
  };
}

export function formatHuf(value: number): string {
  return `${roundHuf(value).toLocaleString("hu-HU")} FT`;
}
