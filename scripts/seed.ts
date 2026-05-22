import "dotenv/config";
import mongoose from "mongoose";
import ShopContent from "../src/models/ShopContent";

const MONGODB_URI = process.env.DATABASE_URL;

const initialContent = [
  {
    key: "hero_title",
    value: "Lorem Ipsum Dolor",
    section: "hero",
  },
  {
    key: "hero_description",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    section: "hero",
  },
  {
    key: "hero_primary_cta",
    value: "GO TO SHOP",
    section: "hero",
  },
  {
    key: "hero_secondary_cta",
    value: "ABOUT US",
    section: "hero",
  },
  {
    key: "hero_badges",
    value: JSON.stringify([
      { title: "LOREM", subtitle: "IPSUM" },
      { title: "DOLOR", subtitle: "SIT" },
      { title: "AMET", subtitle: "ELIT" }
    ]),
    section: "hero",
  },
  {
    key: "story_title",
    value: "Lorem Ipsum Story",
    section: "story",
  },
  {
    key: "story_content",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    section: "story",
  },
  {
    key: "story_cards",
    value: JSON.stringify([
      { title: "LOREM", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { title: "IPSUM", content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
      { title: "DOLOR", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." },
      { title: "AMET", content: "Duis aute irure dolor in reprehenderit in voluptate velit esse." }
    ]),
    section: "story",
  },
  {
    key: "features_title",
    value: "GENERIC ADVANTAGES",
    section: "features",
  },
  {
    key: "features_subtitle",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    section: "features",
  },
  {
    key: "features_cards",
    value: JSON.stringify([
      { title: "FAST DELIVERY", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { title: "QUALITY", content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
      { title: "SUPPORT", content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." }
    ]),
    section: "features",
  },
  {
    key: "reviews_title",
    value: "CUSTOMER REVIEWS",
    section: "reviews",
  },
  {
    key: "reviews_subtitle",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    section: "reviews",
  },
  {
    key: "shop_title",
    value: "PRODUCT CATALOG",
    section: "shop",
  },
  {
    key: "shop_description",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    section: "shop",
  },
  {
    key: "shop_view_all_label",
    value: "VIEW ALL PRODUCTS",
    section: "shop",
  },
  {
    key: "shop_featured_title",
    value: "FEATURED PRODUCTS",
    section: "shop",
  },
  {
    key: "contact_title",
    value: "GET IN TOUCH",
    section: "contact",
  },
  {
    key: "contact_highlight",
    value: "WITH US",
    section: "contact",
  },
  {
    key: "contact_description",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    section: "contact",
  },
  {
    key: "contact_form_button",
    value: "SEND MESSAGE",
    section: "contact",
  },
  {
    key: "shop_seo_title",
    value: "Webshop | Lorem Ipsum Store",
    section: "shop",
  },
  {
    key: "shop_seo_description",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    section: "shop",
  },
  {
    key: "contact_email",
    value: "hello@example.com",
    section: "contact",
  },
  {
    key: "contact_phone",
    value: "+1 555 000 0000",
    section: "contact",
  },
  {
    key: "contact_address",
    value: "123 Example Street, Example City",
    section: "contact",
  },
];

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  console.log("Start seeding...");
  
  for (const item of initialContent) {
    await ShopContent.findOneAndUpdate(
      { key: item.key },
      item,
      { upsert: true, returnDocument: "after" }
    );
  }

  console.log("Seeding finished.");
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
