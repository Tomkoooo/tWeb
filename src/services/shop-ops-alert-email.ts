import dbConnect from "@/lib/db";
import { parseContactEmailsFromShopContent, primaryContactEmail } from "@/lib/contact-emails";
import { ShopContentService } from "@/services/shop-content";

/** Shop CMS contact or env override (same chain as invoice failure alerts). */
export async function resolveShopOpsAlertEmail(): Promise<string> {
  await dbConnect();
  const content = await ShopContentService.getAll();
  const fromList = primaryContactEmail(parseContactEmailsFromShopContent(content));
  return String(fromList || content.contact_email || process.env.INVOICE_ERROR_ALERT_EMAIL || "").trim();
}
