import { NextResponse } from "next/server";
import { FeatureFlagService } from "@/services/feature-flags";

export async function GET() {
  const isShopEnabled = await FeatureFlagService.isEnabled("shopPage", true);
  return NextResponse.json({ enabled: isShopEnabled });
}
