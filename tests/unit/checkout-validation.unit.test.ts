import { beforeEach, describe, expect, it, vi } from "vitest";

const dbConnectMock = vi.fn();
const productFindByIdMock = vi.fn();
const shippingFindOneMock = vi.fn();
const paymentFindOneMock = vi.fn();
const paymentCreateMock = vi.fn();
const couponFindOneMock = vi.fn();
const resolveGlsMethodMock = vi.fn();
const resolveFoxpostMethodMock = vi.fn();
const flagEnabledMock = vi.fn();

vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/Product", () => ({ default: { findById: productFindByIdMock } }));
vi.mock("@/models/ShippingMethod", () => ({ default: { findOne: shippingFindOneMock } }));
vi.mock("@/models/PaymentMethod", () => ({
  default: { findOne: paymentFindOneMock, create: paymentCreateMock },
}));
vi.mock("@/models/Coupon", () => ({
  default: { findOne: couponFindOneMock },
  DiscountType: { FREE_SHIPPING: "free_shipping", PERCENTAGE: "percentage", FIXED: "fixed" },
}));
vi.mock("@/services/gls-shipping", () => ({ resolveConfiguredGlsShippingMethod: resolveGlsMethodMock }));
vi.mock("@/services/foxpost-shipping", () => ({
  resolveConfiguredFoxpostShippingMethod: resolveFoxpostMethodMock,
}));
vi.mock("@/services/shop-trading-settings", () => ({
  ShopTradingSettingsService: {
    get: vi.fn().mockResolvedValue({
      shippingAllowedCountryCodes: [],
      invoicingAllowedCountryCodes: [],
    }),
  },
}));
vi.mock("@/services/feature-flags", () => ({ FeatureFlagService: { isEnabled: flagEnabledMock } }));

describe("checkout-validation unit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productFindByIdMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: "p1",
        name: "Termek",
        isActive: true,
        isVisible: true,
        netPrice: 1000,
        discount: 0,
        variants: [],
      }),
    });
    shippingFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: { toString: () => "ship1" }, grossPrice: 999 }) });
    paymentFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: { toString: () => "pay1" }, grossPrice: 0 }) });
    couponFindOneMock.mockResolvedValue(null);
    flagEnabledMock.mockResolvedValue(true);
    resolveGlsMethodMock.mockResolvedValue({ id: "ship_gls", grossPrice: 1200 });
    resolveFoxpostMethodMock.mockResolvedValue({ id: "ship_fox", grossPrice: 990 });
    paymentCreateMock.mockResolvedValue({ _id: { toString: () => "stripe-db-id" } });
  });

  it("validates standard payload", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    const result = await validateAndNormalizeCheckoutInput({
      items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
      billingInfo: {
        type: "personal",
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingAddress: {
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingMethod: "507f1f77bcf86cd799439012",
      paymentMethod: "507f1f77bcf86cd799439013",
    });

    expect(result.shippingMethod).toBe("ship1");
    expect(result.paymentMethod).toBe("pay1");
    expect(result.paymentProvider).toBe("standard");
    expect(result.saveAddressToProfile).toBe(false);
    expect(result.billingCountry).toBe("Magyarország");
    expect(result.shippingCountry).toBe("Magyarország");
  });

  it("defaults saveAddressToProfile on for authenticated checkout", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    const uid = "507f1f77bcf86cd799439099";
    const result = await validateAndNormalizeCheckoutInput(
      {
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
          country: "  RO  ",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "2222",
          city: "Deb",
          street: "Ut 2",
          email: "a@a.com",
          phone: "222",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "507f1f77bcf86cd799439013",
      },
      { userId: uid }
    );
    expect(result.saveAddressToProfile).toBe(true);
    expect(result.billingCountryCode).toBe("RO");
    expect(result.shippingCountryCode).toBe("RO");
  });

  it("honours saveAddressToProfile false for authenticated checkout", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    const result = await validateAndNormalizeCheckoutInput(
      {
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "507f1f77bcf86cd799439013",
        saveAddressToProfile: false,
      },
      { userId: "507f1f77bcf86cd799439099" }
    );
    expect(result.saveAddressToProfile).toBe(false);
  });

  it("validates GLS fixed path and requires parcel point", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "gls_fixed",
        paymentMethod: "507f1f77bcf86cd799439013",
      })
    ).rejects.toThrow("A GLS csomagpont kiválasztása kötelező");
  });

  it("validates Foxpost fixed path and requires parcel point", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "foxpost_fixed",
        paymentMethod: "507f1f77bcf86cd799439013",
      })
    ).rejects.toThrow("A Foxpost csomagautomata kiválasztása kötelező");
  });

  it("resolves Foxpost fixed shipping with parcel point", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    const result = await validateAndNormalizeCheckoutInput({
      items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
      billingInfo: {
        type: "personal",
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingAddress: {
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingMethod: "foxpost_fixed",
      paymentMethod: "507f1f77bcf86cd799439013",
      foxpostParcelPoint: { id: "hu5516", name: "Fox automata" },
    });
    expect(result.shippingMethod).toBe("ship_fox");
    expect(result.foxpostParcelPoint?.id).toBe("hu5516");
  });

  it("supports stripe fixed payment path", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    paymentFindOneMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    const result = await validateAndNormalizeCheckoutInput(
      {
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "stripe_fixed",
      },
      { allowStripeFixed: true }
    );
    expect(result.paymentProvider).toBe("stripe");
    expect(result.paymentMethod).toBe("stripe-db-id");
  });

  it("rejects stripe fixed when allow flag is false", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "stripe_fixed",
      })
    ).rejects.toThrow("A kiválasztott fizetési mód nem támogatott");
  });

  it("rejects invalid shipping and payment method IDs", async () => {
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "x",
        paymentMethod: "y",
      })
    ).rejects.toThrow("Érvénytelen szállítási mód");
  });

  it("rejects when shipping method is unavailable", async () => {
    shippingFindOneMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "507f1f77bcf86cd799439013",
      })
    ).rejects.toThrow("A kiválasztott szállítási mód nem elérhető");
  });

  it("rejects when payment method is unavailable", async () => {
    paymentFindOneMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "507f1f77bcf86cd799439013",
      })
    ).rejects.toThrow("A kiválasztott fizetési mód nem elérhető");
  });

  it("handles free shipping coupon", async () => {
    couponFindOneMock.mockResolvedValueOnce({
      code: "FS",
      isActive: true,
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() + 1000),
      type: "free_shipping",
      value: 0,
      usedCount: 0,
    });
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    const result = await validateAndNormalizeCheckoutInput({
      items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
      billingInfo: {
        type: "personal",
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingAddress: {
        name: "Teszt",
        zip: "1111",
        city: "Bp",
        street: "Fo 1",
        email: "a@a.com",
        phone: "111",
      },
      shippingMethod: "507f1f77bcf86cd799439012",
      paymentMethod: "507f1f77bcf86cd799439013",
      couponCodes: ["FS"],
    });
    expect(result.shippingFee).toBe(0);
  });

  it("rejects invalid coupon", async () => {
    couponFindOneMock.mockResolvedValueOnce(null);
    const { validateAndNormalizeCheckoutInput } = await import("@/services/checkout-validation");
    await expect(
      validateAndNormalizeCheckoutInput({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {
          type: "personal",
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingAddress: {
          name: "Teszt",
          zip: "1111",
          city: "Bp",
          street: "Fo 1",
          email: "a@a.com",
          phone: "111",
        },
        shippingMethod: "507f1f77bcf86cd799439012",
        paymentMethod: "507f1f77bcf86cd799439013",
        couponCodes: ["BAD"],
      })
    ).rejects.toThrow("Érvénytelen kuponkód");
  });
});
