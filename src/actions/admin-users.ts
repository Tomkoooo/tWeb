"use server";

import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import PasswordResetToken from "@/models/PasswordResetToken";
import { requireAdmin } from "@/lib/admin-auth";
import { formatEmailFromHeader } from "@/lib/email-from";
import { hashPassword, sha256Hex } from "@/lib/password";

type UserRole = "ADMIN" | "USER";
type UserOrderStats = {
  _id: { toString: () => string };
  totalSpent: number;
  ordersCount: number;
  lastOrderAt: string | Date | null;
};

type AdminUserRow = {
  _id: { toString: () => string };
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
};

type RecentUserOrder = {
  _id: { toString: () => string };
  total: number;
  status: string;
  createdAt: Date | string;
};

type UserOrderRow = {
  _id: { toString: () => string };
  total: number;
  status: string;
  createdAt: Date | string;
  items: { name: string; quantity: number; variantLabel?: string }[];
  billingInfo?: {
    type?: "personal" | "company";
    name?: string;
    taxNumber?: string;
    zip?: string;
    city?: string;
    street?: string;
  };
  shippingAddress?: {
    name?: string;
    zip?: string;
    city?: string;
    street?: string;
    comment?: string;
  };
};

type AdminUserFilters = {
  q?: string;
  role?: string;
  hasOrders?: string;
};

function normalizeRole(role: string): UserRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getTransporter() {
  const user = process.env.EMAIL_USER || "test@example.com";
  const pass = process.env.EMAIL_PASS || "password";
  const host = process.env.EMAIL_HOST || "smtp.example.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function getAdminUsers(filters: AdminUserFilters = {}) {
  await requireAdmin();
  await dbConnect();
  const query: Record<string, any> = {};
  const search = String(filters.q || "").trim();
  if (filters.role && filters.role !== "all") query.role = normalizeRole(filters.role);
  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [usersRaw, spendingByUserRaw] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).lean(),
    Order.aggregate([
      { $match: { user: { $exists: true, $ne: null }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$total" },
          ordersCount: { $sum: 1 },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]),
  ]);

  const users = usersRaw as AdminUserRow[];
  const spendingByUser = spendingByUserRaw as UserOrderStats[];
  const userIds = users.map((user) => user._id);
  const recentOrdersRaw = userIds.length
    ? await Order.find({ user: { $in: userIds } })
        .sort({ createdAt: -1 })
        .select("_id user total status createdAt")
        .lean()
    : [];
  const recentOrdersMap = new Map<string, RecentUserOrder[]>();
  for (const order of recentOrdersRaw as Array<RecentUserOrder & { user?: { toString: () => string } }>) {
    const userId = order.user?.toString();
    if (!userId) continue;
    const current = recentOrdersMap.get(userId) || [];
    if (current.length < 5) {
      current.push(order);
      recentOrdersMap.set(userId, current);
    }
  }

  const spendingMap = new Map(
    spendingByUser.map((item) => [item._id.toString(), item])
  );

  let enriched = users.map((user) => {
    const stats = spendingMap.get(user._id.toString());
    return {
      ...user,
      ordersCount: stats?.ordersCount || 0,
      totalSpent: stats?.totalSpent || 0,
      lastOrderAt: stats?.lastOrderAt || null,
      recentOrders: recentOrdersMap.get(user._id.toString()) || [],
    };
  });

  if (filters.hasOrders === "yes") {
    enriched = enriched.filter((user) => user.ordersCount > 0);
  } else if (filters.hasOrders === "no") {
    enriched = enriched.filter((user) => user.ordersCount === 0);
  }

  return JSON.parse(JSON.stringify(enriched));
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  await dbConnect();

  await User.findByIdAndUpdate(userId, { role: normalizeRole(role) });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateAdminUserProfile(userId: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = normalizeRole(String(formData.get("role") || "USER"));

  if (!email) throw new Error("Email megadása kötelező.");
  const existing = await User.findOne({ email, _id: { $ne: userId } }).lean();
  if (existing) throw new Error("Ez az email cím már használatban van.");

  await User.findByIdAndUpdate(userId, {
    name: name || undefined,
    email,
    role,
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateAdminUserPassword(userId: string, formData: FormData) {
  await requireAdmin();
  await dbConnect();

  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    throw new Error("A jelszónak legalább 8 karakter hosszúnak kell lennie.");
  }

  await User.findByIdAndUpdate(userId, { passwordHash: hashPassword(password) });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function getAdminUserDetails(userId: string) {
  await requireAdmin();
  await dbConnect();

  const [userRaw, ordersRaw] = await Promise.all([
    User.findById(userId).lean(),
    Order.find({ user: userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!userRaw) {
    return null;
  }

  const user = userRaw as AdminUserRow & {
    billingInfo?: {
      type?: "personal" | "company";
      name?: string;
      taxNumber?: string;
      country?: string;
      city?: string;
      zip?: string;
      street?: string;
    };
    shippingAddress?: {
      name?: string;
      country?: string;
      city?: string;
      zip?: string;
      street?: string;
      comment?: string;
    };
    createdAt?: Date | string;
    passwordHash?: string;
  };

  const orders = ordersRaw as UserOrderRow[];
  const totalSpent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return JSON.parse(
    JSON.stringify({
      user: {
        ...user,
        hasPassword: Boolean(user.passwordHash),
      },
      orders,
      stats: {
        ordersCount: orders.length,
        totalSpent,
        lastOrderAt: orders[0]?.createdAt || null,
      },
    })
  );
}

export async function sendAdminPasswordReset(userId: string) {
  await requireAdmin();
  await dbConnect();

  const user = await User.findById(userId).lean();
  if (!user?.email) {
    throw new Error("A felhasználóhoz nincs email cím beállítva.");
  }

  await PasswordResetToken.deleteMany({ user: userId, usedAt: { $exists: false } });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await PasswordResetToken.create({
    user: userId,
    tokenHash,
    expiresAt,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password/${rawToken}`;

  const transporter = await getTransporter();

  await transporter.sendMail({
    from: formatEmailFromHeader(),
    to: user.email,
    subject: "Jelszó visszaállítás",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Jelszó visszaállítás</h2>
        <p>Kedves ${user.name || "Vásárló"}!</p>
        <p>Az admin felületről jelszó visszaállítás indult a fiókodhoz.</p>
        <p>Kattints az alábbi gombra a jelszó beállításához (60 percig érvényes):</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#FF5500;color:white;padding:12px 18px;text-decoration:none;">Jelszó visszaállítása</a>
        </p>
        <p>Ha nem te kérted, ezt az emailt figyelmen kívül hagyhatod.</p>
      </div>
    `,
  });

  revalidatePath(`/admin/users/${userId}`);
}
