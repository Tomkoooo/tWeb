"use server"

import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";
import PaymentMethod from "@/models/PaymentMethod";
import Coupon from "@/models/Coupon";
import { revalidatePath } from "next/cache";

// Shipping Methods
export async function createShippingMethod(formData: FormData) {
  const name = formData.get("name") as string;
  const grossPrice = parseFloat(formData.get("grossPrice") as string);
  const isActive = formData.get("isActive") === "true";

  try {
    await dbConnect();
    await ShippingMethod.create({ name, grossPrice, isActive });
  } catch (error) {
    console.error("Error creating shipping method:", error);
  }
  revalidatePath("/admin/shipping");
}

export async function updateShippingMethod(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const grossPrice = parseFloat(formData.get("grossPrice") as string);
  const isActive = formData.get("isActive") === "true";

  try {
    await dbConnect();
    await ShippingMethod.findByIdAndUpdate(id, { name, grossPrice, isActive });
  } catch (error) {
    console.error("Error updating shipping method:", error);
  }
  revalidatePath("/admin/shipping");
}

export async function deleteShippingMethod(id: string) {
  try {
    await dbConnect();
    await ShippingMethod.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting shipping method:", error);
  }
  revalidatePath("/admin/shipping");
}

// Payment Methods
export async function createPaymentMethod(formData: FormData) {
  const name = formData.get("name") as string;
  const grossPrice = parseFloat(formData.get("grossPrice") as string);
  const isActive = formData.get("isActive") === "true";

  try {
    await dbConnect();
    await PaymentMethod.create({ name, grossPrice, isActive });
  } catch (error) {
    console.error("Error creating payment method:", error);
  }
  revalidatePath("/admin/payment");
}

export async function updatePaymentMethod(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const grossPrice = parseFloat(formData.get("grossPrice") as string);
  const isActive = formData.get("isActive") === "true";

  try {
    await dbConnect();
    await PaymentMethod.findByIdAndUpdate(id, { name, grossPrice, isActive });
  } catch (error) {
    console.error("Error updating payment method:", error);
  }
  revalidatePath("/admin/payment");
}

export async function deletePaymentMethod(id: string) {
  try {
    await dbConnect();
    await PaymentMethod.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting payment method:", error);
  }
  revalidatePath("/admin/payment");
}

// Coupons
export async function createCoupon(data: any) {
  try {
    await dbConnect();
    await Coupon.create(data);
  } catch (error) {
    console.error("Error creating coupon:", error);
  }
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  try {
    await dbConnect();
    await Coupon.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting coupon:", error);
  }
  revalidatePath("/admin/coupons");
}
