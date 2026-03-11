import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireAdminMock = vi.fn();
const authMock = vi.fn();
const revalidatePathMock = vi.fn();
const dbConnectMock = vi.fn();
const featureFindOneAndUpdateMock = vi.fn();
const featureFindMock = vi.fn();
const orderFindByIdMock = vi.fn();
const orderFindMock = vi.fn();
const glsCreateLabelMock = vi.fn();
const mailerSendMock = vi.fn();

const shippingCreateMock = vi.fn();
const shippingUpdateMock = vi.fn();
const shippingDeleteMock = vi.fn();
const paymentCreateMock = vi.fn();
const paymentUpdateMock = vi.fn();
const paymentDeleteMock = vi.fn();
const couponCreateMock = vi.fn();
const couponDeleteMock = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/lib/admin-auth", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/FeatureFlag", () => ({
  default: { findOneAndUpdate: featureFindOneAndUpdateMock, find: featureFindMock },
}));
vi.mock("@/services/gls", () => ({
  GlsService: { createLabelForOrder: glsCreateLabelMock },
}));
vi.mock("@/services/mailer", () => ({ MailerService: { sendEmail: mailerSendMock } }));
vi.mock("@/models/Order", () => ({
  default: { findById: orderFindByIdMock, find: orderFindMock },
}));
vi.mock("@/models/ShippingMethod", () => ({
  default: {
    create: shippingCreateMock,
    findByIdAndUpdate: shippingUpdateMock,
    findByIdAndDelete: shippingDeleteMock,
  },
}));
vi.mock("@/models/PaymentMethod", () => ({
  default: {
    create: paymentCreateMock,
    findByIdAndUpdate: paymentUpdateMock,
    findByIdAndDelete: paymentDeleteMock,
  },
}));
vi.mock("@/models/Coupon", () => ({ default: { create: couponCreateMock, findByIdAndDelete: couponDeleteMock } }));

describe("admin actions and routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminMock.mockResolvedValue({});
    authMock.mockResolvedValue({ user: { role: "ADMIN", id: "507f1f77bcf86cd799439011" } });
    featureFindMock.mockReturnValue({ sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) });
    orderFindMock.mockReturnValue({ sort: vi.fn().mockResolvedValue([]) });
    orderFindByIdMock.mockResolvedValue({
      _id: { toString: () => "ord1" },
      status: "pending",
      billingInfo: { email: "u@test.hu" },
      shippingAddress: { name: "Name" },
      glsParcelPoint: { id: "123", name: "point" },
      save: vi.fn(),
      populate: vi.fn().mockResolvedValue({
        _id: { toString: () => "ord1" },
        status: "pending",
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "Name" },
        user: { email: "u@test.hu", name: "Name" },
        save: vi.fn(),
      }),
    });
    glsCreateLabelMock.mockResolvedValue({ labelDataBase64: "UERG", parcelNumber: "123" });
  });

  it("seeds and returns feature flags", async () => {
    const { getAdminFeatureFlags } = await import("@/actions/admin-flags");
    const flags = await getAdminFeatureFlags();
    expect(Array.isArray(flags)).toBe(true);
    expect(featureFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("updates one feature flag and revalidates", async () => {
    const { updateFeatureFlag } = await import("@/actions/admin-flags");
    await updateFeatureFlag("shopPage", false);
    expect(featureFindOneAndUpdateMock).toHaveBeenCalledWith({ key: "shopPage" }, { enabled: false }, { new: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/info");
  });

  it("runs checkout admin CRUD actions", async () => {
    const {
      createShippingMethod,
      updateShippingMethod,
      deleteShippingMethod,
      createPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      createCoupon,
      deleteCoupon,
    } = await import("@/actions/admin-checkout");
    const fd = new FormData();
    fd.set("name", "X");
    fd.set("grossPrice", "1000");
    fd.set("isActive", "true");

    await createShippingMethod(fd);
    await updateShippingMethod("id1", fd);
    await deleteShippingMethod("id1");
    await createPaymentMethod(fd);
    await updatePaymentMethod("id1", fd);
    await deletePaymentMethod("id1");
    await createCoupon({ code: "A" });
    await deleteCoupon("cid1");

    expect(shippingCreateMock).toHaveBeenCalled();
    expect(shippingUpdateMock).toHaveBeenCalled();
    expect(shippingDeleteMock).toHaveBeenCalled();
    expect(paymentCreateMock).toHaveBeenCalled();
    expect(paymentUpdateMock).toHaveBeenCalled();
    expect(paymentDeleteMock).toHaveBeenCalled();
    expect(couponCreateMock).toHaveBeenCalled();
    expect(couponDeleteMock).toHaveBeenCalled();
  });

  it("covers admin order action reads and status update", async () => {
    orderFindMock.mockReturnValue({ sort: vi.fn().mockResolvedValue([{ _id: "o1" }]) });
    orderFindByIdMock.mockReturnValue({
      populate: vi.fn().mockResolvedValue({
        _id: { toString: () => "ord1" },
        status: "pending",
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "Name" },
        user: { email: "u@test.hu", name: "Name" },
        save: vi.fn(),
      }),
    });

    const { getOrders, getOrderById, updateOrderStatus } = await import("@/actions/admin-orders");
    const orders = await getOrders();
    const order = await getOrderById("ord1");
    const updateResult = await updateOrderStatus("ord1", "processing");

    expect(Array.isArray(orders)).toBe(true);
    expect(order).toBeTruthy();
    expect(updateResult.success).toBe(true);
  });

  it("generates gls label from admin order action", async () => {
    const { generateOrderGlsLabel } = await import("@/actions/admin-orders");
    const result = await generateOrderGlsLabel("507f1f77bcf86cd799439011");
    expect(result.success).toBe(true);
    expect(glsCreateLabelMock).toHaveBeenCalled();
  });

  it("returns failure payload when gls label generation throws", async () => {
    glsCreateLabelMock.mockRejectedValueOnce(new Error("gls-fail"));
    const { generateOrderGlsLabel } = await import("@/actions/admin-orders");
    const result = await generateOrderGlsLabel("507f1f77bcf86cd799439011");
    expect(result.success).toBe(false);
    expect(result.error).toContain("gls-fail");
  });

  it("serves GLS pdf stream for admin", async () => {
    orderFindByIdMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ glsLabel: { labelDataBase64: "UERG" } }),
    });
    const { GET } = await import("@/app/api/admin/orders/[id]/gls-label/route");
    const req = new NextRequest("http://localhost/api/admin/orders/1/gls-label");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("returns 404 when gls label payload missing", async () => {
    orderFindByIdMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ glsLabel: {} }),
    });
    const { GET } = await import("@/app/api/admin/orders/[id]/gls-label/route");
    const req = new NextRequest("http://localhost/api/admin/orders/1/gls-label");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 401 from gls-label route when unauthorized", async () => {
    requireAdminMock.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/admin/orders/[id]/gls-label/route");
    const req = new NextRequest("http://localhost/api/admin/orders/1/gls-label");
    const res = await GET(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("throws unauthorized from admin actions for non-admin users", async () => {
    authMock.mockResolvedValueOnce({ user: { role: "USER" } });
    const { getOrders } = await import("@/actions/admin-orders");
    await expect(getOrders()).rejects.toThrow("Unauthorized");
  });

  it("throws when admin order is missing for status update", async () => {
    orderFindByIdMock.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValue(null),
    });
    const { updateOrderStatus } = await import("@/actions/admin-orders");
    await expect(updateOrderStatus("missing", "processing")).rejects.toThrow("Order not found");
  });

  it("throws when gls order is missing or no parcel point", async () => {
    orderFindByIdMock.mockResolvedValueOnce(null);
    const { generateOrderGlsLabel } = await import("@/actions/admin-orders");
    await expect(generateOrderGlsLabel("missing")).rejects.toThrow("Order not found");

    orderFindByIdMock.mockResolvedValueOnce({
      _id: { toString: () => "ord1" },
      save: vi.fn(),
      glsParcelPoint: null,
    });
    await expect(generateOrderGlsLabel("ord1")).rejects.toThrow("nincs GLS csomagpont");
  });

  it("handles status email send failure branch", async () => {
    mailerSendMock.mockRejectedValueOnce(new Error("smtp fail"));
    orderFindByIdMock.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValue({
        _id: { toString: () => "ord1" },
        status: "pending",
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "Name" },
        user: { email: "u@test.hu", name: "Name" },
        save: vi.fn(),
      }),
    });
    const { updateOrderStatus } = await import("@/actions/admin-orders");
    const result = await updateOrderStatus("ord1", "processing");
    expect(result.success).toBe(true);
  });

  it("covers status label fallback branch with custom status", async () => {
    orderFindByIdMock.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValue({
        _id: { toString: () => "ord2" },
        status: "custom_status_old",
        billingInfo: { email: "u@test.hu" },
        shippingAddress: { name: "Name" },
        user: { email: "u@test.hu", name: "Name" },
        save: vi.fn(),
      }),
    });
    const { updateOrderStatus } = await import("@/actions/admin-orders");
    const result = await updateOrderStatus("ord2", "custom_status_new");
    expect(result.success).toBe(true);
  });

  it("covers update status branch when customer email is missing", async () => {
    orderFindByIdMock.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValue({
        _id: { toString: () => "ord3" },
        status: "pending",
        billingInfo: {},
        shippingAddress: { name: "Name" },
        user: {},
        save: vi.fn(),
      }),
    });
    const { updateOrderStatus } = await import("@/actions/admin-orders");
    const result = await updateOrderStatus("ord3", "processing");
    expect(result.success).toBe(true);
    expect(mailerSendMock).not.toHaveBeenCalled();
  });

  it("covers generate label path without session user id", async () => {
    authMock.mockResolvedValueOnce({ user: { role: "ADMIN" } }).mockResolvedValueOnce({ user: { role: "ADMIN" } });
    const { generateOrderGlsLabel } = await import("@/actions/admin-orders");
    const result = await generateOrderGlsLabel("507f1f77bcf86cd799439011");
    expect(result.success).toBe(true);
  });

  it("covers non-Error throw branch in gls generation", async () => {
    glsCreateLabelMock.mockRejectedValueOnce("raw-failure");
    const { generateOrderGlsLabel } = await import("@/actions/admin-orders");
    const result = await generateOrderGlsLabel("507f1f77bcf86cd799439011");
    expect(result.success).toBe(false);
    expect(result.error).toContain("sikertelen");
  });
});
