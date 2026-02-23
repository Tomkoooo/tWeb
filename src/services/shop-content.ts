import dbConnect from "@/lib/db";
import ShopContent from "@/models/ShopContent";

export type ShopContentKey = 
  | "hero_title"
  | "hero_description"
  | "story_title"
  | "story_content"
  | "story_accordions"
  | "contact_email"
  | "contact_phone"
  | "contact_address";

export const ShopContentService = {
  async getBySection(section: string): Promise<Record<string, string>> {
    await dbConnect();
    const content = await ShopContent.find({ section }).lean();
    
    return content.reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
  },

  async getAll(): Promise<Record<string, string>> {
    await dbConnect();
    const content = await ShopContent.find({}).lean();
    
    return content.reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
  },

  async update(key: string, value: string, section: string): Promise<any> {
    await dbConnect();
    return ShopContent.findOneAndUpdate(
      { key },
      { value, section },
      { upsert: true, new: true }
    );
  },

  async updateMany(items: { key: string; value: string; section: string }[]) {
    await dbConnect();
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { key: item.key },
        update: { value: item.value, section: item.section },
        upsert: true,
      },
    }));
    return ShopContent.bulkWrite(bulkOps);
  }
};
