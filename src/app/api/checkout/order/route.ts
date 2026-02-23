import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { OrderService } from "@/services/order";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  try {
    const orderData = await req.json();
    const order = await OrderService.createOrder(orderData, session?.user?.id);
    
    return NextResponse.json({ 
      success: true, 
      orderId: order._id 
    });
  } catch (error: any) {
    console.error("Order POST error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 400 });
  }
}
