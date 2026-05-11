import { beforeEach, describe, expect, it, vi } from "vitest";

const dbConnectMock = vi.fn();
const productFindByIdMock = vi.fn();
const { decrementCheckoutLineStockMock } = vi.hoisted(() => ({
  decrementCheckoutLineStockMock: vi.fn(),
}));
const cartFindOneAndUpdateMock = vi.fn();
const orderFindByIdMock = vi.fn();
const sendEmailMock = vi.fn();
const flagEnabledMock = vi.fn();
const orderSaveMock = vi.fn();
const orderConstructorMock = vi.fn();

vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/Product", () => ({ default: { findById: productFindByIdMock } }));
vi.mock("@/models/Cart", () => ({ default: { findOneAndUpdate: cartFindOneAndUpdateMock } }));
vi.mock("@/models/Order", () => ({
  default: Object.assign(
    function MockOrder(this: Record<string, unknown>, payload: Record<string, unknown>) {
      orderConstructorMock(payload);
      Object.assign(this, payload);
      this._id = "order1";
      this.save = orderSaveMock;
    },
    { findById: orderFindByIdMock }
  ),
}));
vi.mock("@/services/mailer", () => ({
  MailerService: { sendEmail: sendEmailMock },
}));
vi.mock("@/services/feature-flags", () => ({
  FeatureFlagService: { isEnabled: flagEnabledMock },
}));
vi.mock("@/services/inventory-reservation", () => ({
  decrementCheckoutLineStock: (...args: unknown[]) => decrementCheckoutLineStockMock(...args),
  InventoryReservationError: class InventoryReservationError extends Error {
    code: string;
    constructor(message: string, code = "INSUFFICIENT_STOCK") {
      super(message);
      this.name = "InventoryReservationError";
      this.code = code;
    }
  },
}));

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    flagEnabledMock.mockResolvedValue(true);
    productFindByIdMock.mockResolvedValue({
      _id: "p1",
      name: "Product 1",
      stock: 10,
      isActive: true,
      isVisible: true,
      variants: [],
      save: vi.fn(),
    });
    orderFindByIdMock.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        user: { email: "u@test.hu", name: "User" },
      }),
    });
    orderSaveMock.mockResolvedValue(undefined);
    sendEmailMock.mockResolvedValue(undefined);
    decrementCheckoutLineStockMock.mockResolvedValue(undefined);
  });

  it("creates order and executes side effects", async () => {
    const { OrderService } = await import("@/services/order");
    const order = await OrderService.createOrderFromCheckoutData(
      {
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1, price: 1000, name: "P1" }],
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "User", zip: "1111", city: "Bp", street: "Test 1" },
        total: 1000,
      },
      "507f1f77bcf86cd799439012"
    );
    expect(order._id).toBe("order1");
    expect(orderConstructorMock).toHaveBeenCalled();
    expect(decrementCheckoutLineStockMock).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("throws when shop is disabled", async () => {
    flagEnabledMock.mockResolvedValue(false);
    const { OrderService } = await import("@/services/order");
    await expect(
      OrderService.createOrder({ items: [] }, "507f1f77bcf86cd799439012")
    ).rejects.toThrow("Jelenleg a rendelés leadás szünetel");
  });

  it("throws when product is missing", async () => {
    const { InventoryReservationError } = await import("@/services/inventory-reservation");
    decrementCheckoutLineStockMock.mockRejectedValueOnce(
      new InventoryReservationError("A termék nem található", "TRANSACTION_FAILED")
    );
    const { OrderService } = await import("@/services/order");
    await expect(
      OrderService.createOrderFromCheckoutData({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: {},
        shippingAddress: {},
      })
    ).rejects.toThrow("A termék nem található");
  });

  it("handles variant stock deduction path", async () => {
    const { OrderService } = await import("@/services/order");
    const order = await OrderService.createOrderFromCheckoutData({
      items: [{ product: "507f1f77bcf86cd799439011", variantId: "v1", quantity: 1 }],
      billingInfo: { email: "u@test.hu" },
      shippingAddress: { name: "User", zip: "1111", city: "Bp", street: "Test 1" },
      total: 1000,
    });
    expect(order._id).toBe("order1");
    expect(decrementCheckoutLineStockMock).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ product: "507f1f77bcf86cd799439011", variantId: "v1", quantity: 1 })
    );
  });

  it("throws for insufficient stock", async () => {
    const { InventoryReservationError } = await import("@/services/inventory-reservation");
    decrementCheckoutLineStockMock.mockRejectedValueOnce(
      new InventoryReservationError("Nincs elég készlet", "INSUFFICIENT_STOCK")
    );
    const { OrderService } = await import("@/services/order");
    await expect(
      OrderService.createOrderFromCheckoutData({
        items: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "User", zip: "1111", city: "Bp", street: "Test 1" },
        total: 1000,
      })
    ).rejects.toThrow("Nincs elég készlet");
  });
});

describe("GlsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GLS_API_USERNAME = "user";
    process.env.GLS_API_PASSWORD = "pass";
    process.env.GLS_CLIENT_NUMBER = "123";
    process.env.GLS_PICKUP_NAME = "Pickup";
    process.env.GLS_PICKUP_STREET = "Street";
    process.env.GLS_PICKUP_HOUSE_NUMBER = "12";
    process.env.GLS_PICKUP_CITY = "Budapest";
    process.env.GLS_PICKUP_ZIP = "1111";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Labels: [80, 68, 70],
        PrintLabelsInfoList: [{ ParcelId: 1, ParcelNumber: 999 }],
      }),
    }));
  });

  it("builds label with parsed response", async () => {
    const { GlsService } = await import("@/services/gls");
    const result = await GlsService.createLabelForOrder({
      _id: { toString: () => "order1" },
      shippingAddress: {
        name: "Teszt Elek",
        street: "Fo utca 12",
        city: "Budapest",
        zip: "1111",
        phone: "+3611111111",
        email: "test@example.com",
      },
      glsParcelPoint: { id: "123-POINT", name: "Point" },
    } as never);

    expect(result.labelDataBase64).toBe("UERG");
    expect(result.parcelNumber).toBe("999");
  });

  it("throws when gls point is missing", async () => {
    const { GlsService } = await import("@/services/gls");
    await expect(
      GlsService.createLabelForOrder({
        shippingAddress: { street: "x", name: "n", city: "c", zip: "1", phone: "2", email: "e" },
      } as never)
    ).rejects.toThrow("A rendeléshez nincs GLS csomagpont mentve.");
  });

  it("throws on non-ok gls api response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );
    const { GlsService } = await import("@/services/gls");
    await expect(
      GlsService.createLabelForOrder({
        _id: { toString: () => "order1" },
        shippingAddress: {
          name: "Teszt Elek",
          street: "Fo utca 12",
          city: "Budapest",
          zip: "1111",
          phone: "+3611111111",
          email: "test@example.com",
        },
        glsParcelPoint: { id: "123-POINT", name: "Point" },
      } as never)
    ).rejects.toThrow("GLS API hiba");
  });

  it("throws on gls api business error list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          Labels: "AAA",
          PrintLabelsErrorList: [{ ErrorDescription: "validation fail" }],
        }),
      })
    );
    const { GlsService } = await import("@/services/gls");
    await expect(
      GlsService.createLabelForOrder({
        _id: { toString: () => "order1" },
        shippingAddress: {
          name: "Teszt Elek",
          street: "Fo utca 12",
          city: "Budapest",
          zip: "1111",
          phone: "+3611111111",
          email: "test@example.com",
        },
        glsParcelPoint: { id: "123-POINT", name: "Point" },
      } as never)
    ).rejects.toThrow("validation fail");
  });
});
