import { NextResponse } from "next/server";
import { FeatureFlagService } from "@/services/feature-flags";

export async function GET() {
  try {
    const enabled = await FeatureFlagService.isEnabled("maintenanceMode", false);
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("Maintenance feature flag GET error:", error);
    return NextResponse.json({ enabled: false }, { status: 500 });
  }
}
