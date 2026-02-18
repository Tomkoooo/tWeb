import "dotenv/config";
import mongoose from "mongoose";
import ShopContent from "../src/models/ShopContent";

const MONGODB_URI = process.env.DATABASE_URL;

const initialContent = [
  {
    key: "hero_title",
    value: "Mestermunka a kezedben",
    section: "hero",
  },
  {
    key: "hero_description",
    value: "Kiváló minőségű kalapácsok, csavarkulcsok és elektromos szerszámok a modern mesterembernek. Fedezd fel a Krausz minőséget!",
    section: "hero",
  },
  {
    key: "story_title",
    value: "A Krausz Örökség",
    section: "story",
  },
  {
    key: "story_content",
    value: "Családi vállalkozásunk több mint 50 éve elkötelezett a minőségi szerszámok gyártása mellett. Minden darab, ami kikerül a kezünk közül, a precizitás és a tartósság jegyében készül. Hiszünk abban, hogy a jó munka alapja a kiváló szerszám.",
    section: "story",
  },
  {
    key: "contact_email",
    value: "info@krauszbarkacs.hu",
    section: "contact",
  },
  {
    key: "contact_phone",
    value: "+36 1 234 5678",
    section: "contact",
  },
  {
    key: "contact_address",
    value: "1052 Budapest, Barkács utca 1.",
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
      { upsert: true, new: true }
    );
  }

  console.log("Seeding finished.");
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
