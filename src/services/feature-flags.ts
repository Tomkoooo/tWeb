import dbConnect from "@/lib/db";
import FeatureFlag from "@/models/FeatureFlag";

export class FeatureFlagService {
  static async isEnabled(key: string, fallback: boolean = false): Promise<boolean> {
    await dbConnect();
    const flag = await FeatureFlag.findOne({ key }).lean();
    if (!flag) return fallback;
    return Boolean(flag.enabled);
  }
}
