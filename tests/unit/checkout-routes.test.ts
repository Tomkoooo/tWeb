import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createJsonRequest } from "../helpers/next-request";

const authMock = vi.fn();
const createOrderMock = vi.fn();
const validateCheckoutMock = vi.fn();
const featureFlagMock = vi.fn();
const dbConnectMock = vi.fn();
const tempOrderCreateMock = vi.fn();
const tempOrderUpdateMock = vi.fn();
const stripeSessionCreateMock = vi.fn();
const finalizeMock = vi.fn();
const constructEventMock = vi.fn();
const tempOrderFindOneAndUpdateMock = vi.fn();

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/services/order", () => ({
  OrderService: {
    createOrder: createOrderMock,
  },
}));
vi.mock("@/services/checkout-validation", () => ({
  STRIPE_FIXED_PAYMENT_METHOD_ID: "stripe_fixed",
  validateAndNormalizeCheckoutInput: validateCheckoutMock,
}));
vi.mock("@/services/feature-flags", () => ({
  FeatureFlagService: {
    isEnabled: featureFlagMock,
  },
}));
vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/TempOrder", () => ({
  default: {
    create: tempOrderCreateMock,
    findByIdAndUpdate: tempOrderUpdateMock,
    findOneAndUpdate: tempOrderFindOneAndUpdateMock,
  },
}));
vi.mock("@/services/stripe", () => ({
  getStripeClient: () => ({
    checkout: { sessions: { create: stripeSessionCreateMock } },
    webhooks: { constructEvent: constructEventMock },
  }),
  getAppBaseUrl: () => "http://localhost:3000",
  getStripeWebhookSecret: () => "secret",
}));
vi.mock("@/services/checkout-finalization", () => ({
  CheckoutFinalizationService: {
    finalizeFromTempOrder: finalizeMock,
  },
}));

describe("checkout and payment routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } });
    featureFlagMock.mockResolvedValue(true);
    validateCheckoutMock.mockResolvedValue({
      items: [{ quantity: 1, price: 1000, name: "Termek" }],
      shippingFee: 100,
      paymentFee: 50,
      paymentProvider: "stripe",
    });
    createOrderMock.mockResolvedValue({ _id: "o1" });
    tempOrderCreateMock.mockResolvedValue({ _id: { toString: () => "tmp1" } });
    stripeSessionCreateMock.mockResolvedValue({ id: "sess1", url: "https://stripe.local" });
    tempOrderUpdateMock.mockResolvedValue({});
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { id: "sess1", payment_intent: "pi_1", metadata: { tempOrderId: "tmp1" } } },
    });
    tempOrderFindOneAndUpdateMock.mockReturnValue({ lean: () => ({ _id: { toString: () => "tmp1" } }) });
    finalizeMock.mockResolvedValue({});
  });

  it("creates standard order via checkout/order route", async () => {
    const { POST } = await import("@/app/api/checkout/order/route");
    const req = createJsonRequest("http://localhost/api/checkout/order", "POST", {
      paymentMethod: "pm1",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(validateCheckoutMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalled();
  });

  it("rejects stripe fixed payment on standard order route", async () => {
    const { POST } = await import("@/app/api/checkout/order/route");
    const req = createJsonRequest("http://localhost/api/checkout/order", "POST", {
      paymentMethod: "stripe_fixed",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates stripe checkout session", async () => {
    const { POST } = await import("@/app/api/checkout/stripe/session/route");
    const req = createJsonRequest("http://localhost/api/checkout/stripe/session", "POST", {
      paymentMethod: "stripe_fixed",
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.checkoutUrl).toBe("https://stripe.local");
    expect(stripeSessionCreateMock).toHaveBeenCalled();
    expect(tempOrderUpdateMock).toHaveBeenCalled();
  });

  it("returns 503 when stripe feature disabled", async () => {
    featureFlagMock.mockImplementation(async (key: string) => key !== "stripePayments");
    const { POST } = await import("@/app/api/checkout/stripe/session/route");
    const req = createJsonRequest("http://localhost/api/checkout/stripe/session", "POST", {});
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("rejects stripe session when provider is not stripe", async () => {
    validateCheckoutMock.mockResolvedValueOnce({
      items: [],
      shippingFee: 0,
      paymentFee: 0,
      paymentProvider: "standard",
    });
    const { POST } = await import("@/app/api/checkout/stripe/session/route");
    const req = createJsonRequest("http://localhost/api/checkout/stripe/session", "POST", {});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("handles stripe webhook and triggers finalization", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }) as unknown as NextRequest;

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.received).toBe(true);
    expect(finalizeMock).toHaveBeenCalledWith("tmp1");
  });

  it("handles missing stripe signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      body: "{}",
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when shop is disabled on order route", async () => {
    featureFlagMock.mockImplementation(async (key: string) => key !== "shopPage");
    const { POST } = await import("@/app/api/checkout/order/route");
    const req = createJsonRequest("http://localhost/api/checkout/order", "POST", {
      paymentMethod: "pm1",
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 400 on order route exception", async () => {
    validateCheckoutMock.mockRejectedValue(new Error("bad"));
    const { POST } = await import("@/app/api/checkout/order/route");
    const req = createJsonRequest("http://localhost/api/checkout/order", "POST", {
      paymentMethod: "pm1",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("handles expired webhook event", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.expired",
      data: { object: { id: "sess-exp" } },
    });
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(tempOrderFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("returns webhook error when signature construction fails", async () => {
    constructEventMock.mockImplementationOnce(() => {
      throw new Error("invalid signature");
    });
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }) as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
