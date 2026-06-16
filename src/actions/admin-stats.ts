"use server";

import { eachDayOfInterval, format } from "date-fns";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Review from "@/models/Review";
import ShopFeedback from "@/models/ShopFeedback";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin } from "@/lib/admin-auth";
import { summarizeAdminCustomers } from "@/lib/admin-customers";
import {
  buildAdminStatsCreatedAtFilter,
  type ResolvedAdminStatsDateRange,
} from "@/lib/admin-stats-date-range";

type AdminOrder = {
  status: string;
  total?: number;
  user?: { toString: () => string } | string | null;
  createdAt: string | Date;
};

type TopProductItem = {
  soldQuantity: number;
  revenue: number;
  productName: string;
};

type DailyOrderItem = {
  product?: { toString: () => string } | string | null;
  name?: string;
  price?: number;
  quantity?: number;
};

type DailyOrder = {
  createdAt: string | Date;
  total?: number;
  items?: DailyOrderItem[];
};

export type DailyIncomeRow = {
  date: string;
  revenue: number;
  orders: number;
};

export type DailyProductRow = {
  date: string;
  productId: string;
  productName: string;
  soldQuantity: number;
  revenue: number;
};

function toLocalDateKey(value: string | Date): string {
  const date = new Date(value);
  return format(date, "yyyy-MM-dd");
}

function productIdKey(product: DailyOrderItem["product"]): string {
  if (!product) return "unknown";
  return typeof product === "string" ? product : product.toString();
}

export async function getAdminStats() {
  await requireAdmin();
  await dbConnect();

  const [
    ordersRaw,
    customerUsersRaw,
    productsCount,
    reviewsCount,
    shopFeedbackCount,
    topProductsAggRaw,
    unreadContactMessagesRaw,
  ] =
    await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).lean(),
      User.find({ role: "USER" }).select("_id email role").lean(),
      Product.countDocuments({}),
      Review.countDocuments({}),
      ShopFeedback.countDocuments({}),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            soldQuantity: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { soldQuantity: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            soldQuantity: 1,
            revenue: 1,
            productName: { $ifNull: [{ $arrayElemAt: ["$product.name", 0] }, "Törölt termék"] },
          },
        },
      ]),
      ContactMessage.find({ status: "unread" }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  const orders = ordersRaw as AdminOrder[];
  const topProductsAgg = topProductsAggRaw as TopProductItem[];
  const customerSummary = summarizeAdminCustomers(ordersRaw, customerUsersRaw);

  const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const totalRevenue = nonCancelledOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const avgOrderValue = nonCancelledOrders.length ? totalRevenue / nonCancelledOrders.length : 0;

  const monthlyRevenue = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);

    const month = date.getMonth();
    const year = date.getFullYear();

    const monthOrders = nonCancelledOrders.filter((order) => {
      const created = new Date(order.createdAt);
      return created.getMonth() === month && created.getFullYear() === year;
    });

    return {
      label: `${year}.${String(month + 1).padStart(2, "0")}`,
      revenue: monthOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      orders: monthOrders.length,
    };
  }).reverse();

  return {
    kpis: {
      totalRevenue,
      ordersCount: orders.length,
      nonCancelledOrdersCount: nonCancelledOrders.length,
      deliveredOrdersCount: deliveredOrders.length,
      customersCount: customerSummary.totalCustomersCount,
      activeCustomersCount: customerSummary.totalCustomersCount,
      totalCustomersCount: customerSummary.totalCustomersCount,
      registeredCustomersCount: customerSummary.registeredCustomersCount,
      registeredOrderCustomersCount: customerSummary.registeredOrderCustomersCount,
      guestCustomersCount: customerSummary.guestCustomersCount,
      productsCount,
      reviewsCount: reviewsCount + shopFeedbackCount,
      avgOrderValue,
    },
    topProducts: topProductsAgg,
    monthlyRevenue,
    recentOrders: JSON.parse(JSON.stringify(orders.slice(0, 5))),
    unreadContactMessages: JSON.parse(JSON.stringify(unreadContactMessagesRaw)),
  };
}

export type OrderedProductRow = {
  productId: string;
  productName: string;
  variantLabel: string | null;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
};

export type GetOrderedProductsFilters = {
  sinceDate?: string;
};

export async function getOrderedProducts(
  filters: GetOrderedProductsFilters = {}
): Promise<OrderedProductRow[]> {
  await requireAdmin();
  await dbConnect();

  const matchStage: Record<string, unknown> = {
    status: { $ne: "cancelled" },
  };

  if (filters.sinceDate) {
    matchStage.createdAt = { $gte: new Date(filters.sinceDate) };
  }

  const aggregationResult = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: {
          productId: "$items.product",
          variantLabel: { $ifNull: ["$items.variantLabel", null] },
        },
        itemName: { $first: "$items.name" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orderIds: { $addToSet: "$_id" },
      },
    },
    { $sort: { totalQuantity: -1 } },
  ]);

  const productIds = [
    ...new Set(
      aggregationResult
        .map((row) => row._id?.productId)
        .filter((id): id is string => !!id)
    ),
  ];

  const productsRaw =
    productIds.length > 0
      ? await Product.find({ _id: { $in: productIds } })
          .select("name")
          .lean()
      : [];

  const productNameById = new Map<string, string>();
  for (const product of productsRaw) {
    const id = String((product as { _id: { toString: () => string } })._id);
    const name = (product as { name?: string }).name;
    if (name) productNameById.set(id, name);
  }

  return aggregationResult.map((row) => {
    const productId = row._id?.productId ? String(row._id.productId) : "unknown";
    return {
      productId,
      productName:
        productNameById.get(productId) || row.itemName || "Törölt termék",
      variantLabel: row._id?.variantLabel || null,
      totalQuantity: row.totalQuantity || 0,
      totalRevenue: row.totalRevenue || 0,
      orderCount: Array.isArray(row.orderIds) ? row.orderIds.length : 0,
    };
  });
}

export async function getAdminDailyStats(range: ResolvedAdminStatsDateRange) {
  await requireAdmin();
  await dbConnect();

  const ordersRaw = await Order.find({
    status: { $ne: "cancelled" },
    createdAt: buildAdminStatsCreatedAtFilter(range),
  })
    .select("createdAt total items")
    .lean();

  const orders = ordersRaw as DailyOrder[];

  const incomeByDate = new Map<string, { revenue: number; orders: number }>();
  const productByDateAndId = new Map<
    string,
    { productId: string; soldQuantity: number; revenue: number; itemName?: string }
  >();

  let totalRevenue = 0;
  let unitsSold = 0;

  for (const order of orders) {
    const dateKey = toLocalDateKey(order.createdAt);
    const orderTotal = order.total || 0;
    totalRevenue += orderTotal;

    const income = incomeByDate.get(dateKey) || { revenue: 0, orders: 0 };
    income.revenue += orderTotal;
    income.orders += 1;
    incomeByDate.set(dateKey, income);

    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const quantity = item.quantity || 0;
      const lineRevenue = (item.price || 0) * quantity;
      unitsSold += quantity;

      const productId = productIdKey(item.product);
      const mapKey = `${dateKey}:${productId}`;
      const existing = productByDateAndId.get(mapKey) || {
        productId,
        soldQuantity: 0,
        revenue: 0,
        itemName: item.name,
      };
      existing.soldQuantity += quantity;
      existing.revenue += lineRevenue;
      if (!existing.itemName && item.name) {
        existing.itemName = item.name;
      }
      productByDateAndId.set(mapKey, existing);
    }
  }

  const daysInRange = eachDayOfInterval({ start: range.start, end: range.end });
  const dailyIncome: DailyIncomeRow[] = daysInRange.map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const income = incomeByDate.get(date);
    return {
      date,
      revenue: income?.revenue || 0,
      orders: income?.orders || 0,
    };
  });

  const productIds = [...new Set([...productByDateAndId.values()].map((row) => row.productId))].filter(
    (id) => id !== "unknown"
  );

  const productsRaw =
    productIds.length > 0
      ? await Product.find({ _id: { $in: productIds } })
          .select("name")
          .lean()
      : [];

  const productNameById = new Map<string, string>();
  for (const product of productsRaw) {
    const id = String((product as { _id: { toString: () => string } })._id);
    const name = (product as { name?: string }).name;
    if (name) productNameById.set(id, name);
  }

  const dailyProducts: DailyProductRow[] = [...productByDateAndId.entries()]
    .map(([mapKey, row]) => {
      const date = mapKey.split(":")[0] || "";
      const productName =
        productNameById.get(row.productId) || row.itemName || "Törölt termék";
      return {
        date,
        productId: row.productId,
        productName,
        soldQuantity: row.soldQuantity,
        revenue: row.revenue,
      };
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return b.revenue - a.revenue;
    });

  return {
    range: {
      preset: range.preset,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      label: range.label,
    },
    summary: {
      revenue: totalRevenue,
      orders: orders.length,
      unitsSold,
    },
    dailyIncome,
    dailyProducts,
  };
}
