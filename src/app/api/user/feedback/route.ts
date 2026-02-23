import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import ShopFeedback from "@/models/ShopFeedback";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Érvénytelen értékelés" }, { status: 400 });
    }

    await dbConnect();

    // Verify user has at least one completed order
    const hasCompletedOrder = await Order.exists({
      user: session.user.id,
      status: "delivered"
    });

    if (!hasCompletedOrder) {
      // Return 403 or specific error so frontend knows why
      return NextResponse.json({ error: "Csak sikeres / kiküldött rendelés után értékelheted a boltot." }, { status: 403 });
    }

    // UPSERT behaviour: If they already submitted feedback, we update it.
    await ShopFeedback.findOneAndUpdate(
      { user: session.user.id },
      { rating, comment },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting shop feedback:", error);
    return NextResponse.json({ error: "Szerver hiba történt" }, { status: 500 });
  }
}
