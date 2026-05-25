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
import {
  buildAdminCustomerRows,
  type AdminCustomerFilters,
} from "@/lib/admin-customers";

type UserRole = "ADMIN" | "USER";
type AdminUserRow = {
  _id: { toString: () => string };
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
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

type AdminUserFilters = AdminCustomerFilters;

function normalizeRole(role: string): UserRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
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

  const [usersRaw, ordersRaw] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).lean(),
    Order.find({})
      .sort({ createdAt: -1 })
      .select("_id user total status createdAt billingInfo.name billingInfo.email shippingAddress.name shippingAddress.email")
      .lean(),
  ]);

  const enriched = buildAdminCustomerRows(usersRaw, ordersRaw, filters);
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
