import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  
  try {
    const { products } = await ProductService.getPaginated(1, 5, { 
      search: q,
      isActive: true,
      isVisible: true
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Live search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
