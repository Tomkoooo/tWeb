"use server";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Review from "@/models/Review";
import ShopFeedback from "@/models/ShopFeedback";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin } from "@/lib/admin-auth";
import { summarizeAdminCustomers } from "@/lib/admin-customers";

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
