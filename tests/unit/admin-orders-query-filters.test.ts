import { describe, expect, it } from "vitest";
import {
  adminFiltersToWorkspaceFilters,
  buildAdminOrdersMongoQuery,
  filterAdminOrdersWithWorkspace,
} from "@/lib/admin-orders-query";

describe("admin orders query filters", () => {
  it("builds mongo query for updated and status-changed date filters", () => {
    const query = buildAdminOrdersMongoQuery({
      updatedFrom: "2026-06-01",
      updatedTo: "2026-06-15",
      statusChangedOn: "2026-06-10",
    });

    const updatedAt = query.updatedAt as { $gte: Date; $lte: Date };
    expect(updatedAt.$gte.getFullYear()).toBe(2026);
    expect(updatedAt.$gte.getMonth()).toBe(5);
    expect(updatedAt.$gte.getDate()).toBe(1);
    expect(updatedAt.$lte.getHours()).toBe(23);

    const statusChangedAt = query.statusChangedAt as { $gte: Date; $lte: Date };
    expect(statusChangedAt.$gte.getDate()).toBe(10);
    expect(statusChangedAt.$lte.getHours()).toBe(23);
  });

  it("applies workspace smart filters for export parity", () => {
    const orders = [
      {
        _id: "a",
        createdAt: "2026-06-01",
        status: "pending",
        items: [{ name: "Small", quantity: 1, price: 1000 }],
        billingInfo: { name: "A", type: "personal" },
        shippingAddress: {},
        subtotal: 1000,
        shippingFee: 0,
        paymentFee: 0,
        discount: 0,
        total: 1000,
      },
      {
        _id: "b",
        createdAt: "2026-06-02",
        status: "pending",
        items: [
          { name: "Big", quantity: 5, price: 2000 },
          { name: "Extra", quantity: 2, price: 500 },
        ],
        billingInfo: { name: "B", type: "company" },
        shippingAddress: {},
        subtotal: 11000,
        shippingFee: 0,
        paymentFee: 0,
        discount: 0,
        total: 11000,
      },
    ];

    const filtered = filterAdminOrdersWithWorkspace(orders, { unitsMin: "5" });
    expect(filtered.map((order) => String(order._id))).toEqual(["b"]);
  });

  it("maps admin filters to workspace filters", () => {
    const workspace = adminFiltersToWorkspaceFilters({
      labelState: "needs",
      totalMin: "5000",
      mix: "abc123",
    });
    expect(workspace.labelState).toBe("needs");
    expect(workspace.totalMin).toBe(5000);
    expect(workspace.mix).toBe("abc123");
  });
});
