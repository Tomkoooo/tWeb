import dbConnect from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

export const EmailTemplateService = {
  async getAll() {
    await dbConnect();
    return EmailTemplate.find({}).lean();
  },

  async getByType(type: string) {
    await dbConnect();
    return EmailTemplate.findOne({ type }).lean();
  },

  async update(type: string, data: any) {
    await dbConnect();
    return EmailTemplate.findOneAndUpdate(
      { type },
      { $set: data },
      { upsert: true, new: true }
    );
  }
};
