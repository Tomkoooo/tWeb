import { beforeEach, describe, expect, it, vi } from "vitest";

const dbConnectMock = vi.fn();
const getAllShopContentMock = vi.fn();

vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/services/shop-content", () => ({
  ShopContentService: { getAll: getAllShopContentMock },
}));

describe("resolveShopOpsAlertEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbConnectMock.mockResolvedValue(undefined);
    delete process.env.INVOICE_ERROR_ALERT_EMAIL;
  });

  it("returns trimmed contact_email from shop content", async () => {
    getAllShopContentMock.mockResolvedValue({ contact_email: " shop@x.test " });
    const { resolveShopOpsAlertEmail } = await import("@/services/shop-ops-alert-email");
    await expect(resolveShopOpsAlertEmail()).resolves.toBe("shop@x.test");
  });

  it("falls back to INVOICE_ERROR_ALERT_EMAIL when contact empty", async () => {
    getAllShopContentMock.mockResolvedValue({});
    process.env.INVOICE_ERROR_ALERT_EMAIL = "ops@fallback.test";
    const { resolveShopOpsAlertEmail } = await import("@/services/shop-ops-alert-email");
    await expect(resolveShopOpsAlertEmail()).resolves.toBe("ops@fallback.test");
  });
});
