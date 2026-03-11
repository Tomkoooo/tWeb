import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const dbConnectMock = vi.fn();
const shippingFindMock = vi.fn();
const paymentFindMock = vi.fn();
const featureFlagMock = vi.fn();
const resolveGlsMethodMock = vi.fn();

const tempFindByIdMock = vi.fn();
const tempFindOneAndUpdateMock = vi.fn();
const tempFindByIdAndUpdateMock = vi.fn();
const orderFindByIdMock = vi.fn();
const createOrderFromCheckoutDataMock = vi.fn();

vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/ShippingMethod", () => ({ default: { find: shippingFindMock } }));
vi.mock("@/models/PaymentMethod", () => ({ default: { find: paymentFindMock } }));
vi.mock("@/services/feature-flags", () => ({
  FeatureFlagService: { isEnabled: featureFlagMock },
}));
vi.mock("@/services/gls-shipping", () => ({
  resolveConfiguredGlsShippingMethod: resolveGlsMethodMock,
}));

vi.mock("@/models/TempOrder", () => ({
  default: {
    findById: tempFindByIdMock,
    findOneAndUpdate: tempFindOneAndUpdateMock,
    findByIdAndUpdate: tempFindByIdAndUpdateMock,
  },
}));
vi.mock("@/models/Order", () => ({ default: { findById: orderFindByIdMock } }));
vi.mock("@/services/order", () => ({
  OrderService: { createOrderFromCheckoutData: createOrderFromCheckoutDataMock },
}));

describe("checkout methods and finalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    featureFlagMock.mockImplementation(async (key: string) => {
      if (key === "shopPage") return true;
      if (key === "stripePayments") return true;
      if (key === "glsParcelPicker") return true;
      return false;
    });
    shippingFindMock.mockReturnValue({
      lean: async () => [{ _id: { toString: () => "ship1" }, name: "Hazhoz", grossPrice: 990, isActive: true }],
    });
    paymentFindMock.mockReturnValue({
      lean: async () => [{ _id: { toString: () => "pay1" }, name: "Utalas", grossPrice: 0, isActive: true }],
    });
    resolveGlsMethodMock.mockResolvedValue({ id: "ship_gls", name: "GLS Csomagpont", grossPrice: 1490 });
  });

  it("returns normalized methods with fixed stripe and gls options", async () => {
    const { GET } = await import("@/app/api/checkout/methods/route");
    const req = new NextRequest("http://localhost/api/checkout/methods");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.shippingMethods[0]._id).toBe("gls_fixed");
    expect(body.paymentMethods[0]._id).toBe("stripe_fixed");
  });

  it("finalizes temp order and marks status", async () => {
    const tempId = "507f1f77bcf86cd799439011";
    tempFindByIdMock
      .mockReturnValueOnce({ lean: async () => ({ _id: tempId, status: "paid", checkoutData: { items: [] }, user: { toString: () => "u1" } }) })
      .mockReturnValueOnce({ lean: async () => null });
    tempFindOneAndUpdateMock.mockResolvedValue({
      _id: tempId,
      checkoutData: { items: [] },
      user: { toString: () => "u1" },
    });
    createOrderFromCheckoutDataMock.mockResolvedValue({ _id: "order1" });

    const { CheckoutFinalizationService } = await import("@/services/checkout-finalization");
    const result = await CheckoutFinalizationService.finalizeFromTempOrder(tempId);

    expect(result.status).toBe("finalized");
    expect(tempFindByIdAndUpdateMock).toHaveBeenCalled();
  });

  it("returns 503 when shop is disabled in methods route", async () => {
    featureFlagMock.mockImplementation(async (key: string) => key !== "shopPage");
    const { GET } = await import("@/app/api/checkout/methods/route");
    const req = new NextRequest("http://localhost/api/checkout/methods");
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("handles invalid temp order id", async () => {
    const { CheckoutFinalizationService } = await import("@/services/checkout-finalization");
    await expect(CheckoutFinalizationService.finalizeFromTempOrder("bad-id")).rejects.toThrow(
      "Érvénytelen ideiglenes rendelés azonosító"
    );
  });

  it("returns 500 when methods route throws", async () => {
    shippingFindMock.mockImplementationOnce(() => {
      throw new Error("db boom");
    });
    const { GET } = await import("@/app/api/checkout/methods/route");
    const req = new NextRequest("http://localhost/api/checkout/methods");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
