import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import ShopFeedback from "@/models/ShopFeedback";

type HomeReview = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  createdAt: string;
};

type PopulatedUser = {
  name?: string;
  image?: string;
};

type ShopFeedbackDoc = {
  _id: { toString: () => string };
  user?: PopulatedUser;
  rating: number;
  comment?: string;
  createdAt?: string | Date;
};

type ProductReviewDoc = {
  _id: { toString: () => string };
  user?: PopulatedUser;
  rating: number;
  description: string;
  createdAt?: string | Date;
};

export class FeedbackService {
  static async getHomepageReviews(limit: number = 6): Promise<HomeReview[]> {
    await dbConnect();

    const [shopFeedbacks, productReviews] = await Promise.all([
      ShopFeedback.find({
        comment: { $exists: true, $ne: "" },
        $or: [{ status: "approved" }, { status: { $exists: false } }],
      })
        .populate("user", "name image")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Review.find({
        description: { $exists: true, $ne: "" },
        $or: [{ status: "approved" }, { status: { $exists: false } }],
      })
        .populate("user", "name image")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const normalizedShop = (shopFeedbacks as ShopFeedbackDoc[]).map((item) => ({
      id: `shop-${item._id.toString()}`,
      name: item.user?.name || "Vásárló",
      role: "Webshop vásárló",
      content: item.comment || "Elégedett vásárló.",
      rating: item.rating,
      avatar: item.user?.image || "/logo.jpg",
      createdAt: new Date(item.createdAt ?? Date.now()).toISOString(),
    }));

    const normalizedProduct = (productReviews as ProductReviewDoc[]).map((item) => ({
      id: `product-${item._id.toString()}`,
      name: item.user?.name || "Vásárló",
      role: "Termék értékelő",
      content: item.description,
      rating: item.rating,
      avatar: item.user?.image || "/logo.jpg",
      createdAt: new Date(item.createdAt ?? Date.now()).toISOString(),
    }));

    return [...normalizedShop, ...normalizedProduct]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
