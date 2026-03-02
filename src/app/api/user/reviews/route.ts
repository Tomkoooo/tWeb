import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Érvénytelen adatok" }, { status: 400 });
    }

    await dbConnect();

    // Verification: Did the user order this product?
    const hasOrdered = await Order.exists({
      user: session.user.id,
      "items.product": productId,
      status: { $in: ["processing", "shipped", "delivered", "cancelled"] }
    });

    if (!hasOrdered) {
      return NextResponse.json({ error: "Csak feldolgozott rendelés után tudsz értékelni." }, { status: 403 });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return NextResponse.json({ error: "Termék nem található" }, { status: 404 });
    }

    await Review.findOneAndUpdate(
      { product: productId, user: session.user.id },
      {
        rating,
        description: comment?.trim() || "Értékelés szöveges megjegyzés nélkül.",
        status: "pending",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Szerver hiba történt" }, { status: 500 });
  }
}
