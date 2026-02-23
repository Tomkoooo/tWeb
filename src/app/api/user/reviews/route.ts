import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

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
      status: "delivered" // Only allow reviews for delivered orders
    });

    if (!hasOrdered) {
      return NextResponse.json({ error: "Csak a megrendelt és átvett termékeket tudod értékelni." }, { status: 403 });
    }

    // Update the product to include the new rating
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Termék nem található" }, { status: 404 });
    }

    // Check if user already reviewed
    const existingReviewIndex = product.ratings.findIndex(
      (r: any) => r.user.toString() === session.user.id
    );

    if (existingReviewIndex >= 0) {
      // Update existing
      product.ratings[existingReviewIndex].rating = rating;
      product.ratings[existingReviewIndex].comment = comment;
      product.ratings[existingReviewIndex].createdAt = new Date();
    } else {
      // Add new
      product.ratings.push({
        user: session.user.id,
        rating,
        comment,
      });
    }

    await product.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Szerver hiba történt" }, { status: 500 });
  }
}
