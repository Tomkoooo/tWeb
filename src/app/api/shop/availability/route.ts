import { NextResponse } from "next/server";
import { isShopEnabled } from "@/lib/features/shop";
import { FeatureFlagService } from "@/services/feature-flags";

export async function GET() {
  if (!isShopEnabled()) {
    return NextResponse.json({ enabled: false });
  }
  const shopPageOn = await FeatureFlagService.isEnabled("shopPage", true);
  return NextResponse.json({ enabled: shopPageOn });
}
