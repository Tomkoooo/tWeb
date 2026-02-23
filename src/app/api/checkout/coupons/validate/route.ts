import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Coupon, { DiscountType } from "@/models/Coupon";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  try {
    await dbConnect();
    const { code, cartValue, items } = await req.json();

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return NextResponse.json({ error: "Érvénytelen kuponkód" }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json({ error: "A kupon lejárt vagy még nem érvényes" }, { status: 400 });
    }

    if (coupon.minCartValue && cartValue < coupon.minCartValue) {
      return NextResponse.json({ 
        error: `A kupon használatához minimum ${coupon.minCartValue.toLocaleString("hu-HU")} FT értékű kosár szükséges` 
      }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "A kupon felhasználási limitje elfogyott" }, { status: 400 });
    }

    if (coupon.applicableUsers && coupon.applicableUsers.length > 0) {
      if (!session?.user?.id || !coupon.applicableUsers.includes(session.user.id as any)) {
        return NextResponse.json({ error: "Ez a kupon az Ön számára nem elérhető" }, { status: 403 });
      }
    }

    // Product specific logic could be added here if coupon.applicableProducts has length > 0

    return NextResponse.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Belső szerverhiba" }, { status: 500 });
  }
}
