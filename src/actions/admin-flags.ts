"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import FeatureFlag from "@/models/FeatureFlag";
import { requireAdmin } from "@/lib/admin-auth";

type FlagSeed = {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

const DEFAULT_FLAGS: FlagSeed[] = [
  {
    key: "newsletter",
    label: "Hírlevél modul",
    description: "Hírlevél oldalak és kampánykezelés engedélyezése.",
    defaultEnabled: false,
  },
  {
    key: "shopPage",
    label: "Shop oldal",
    description: "A /shop oldal és a főoldali termék-kategória blokk engedélyezése.",
    defaultEnabled: true,
  },
  {
    key: "maintenanceMode",
    label: "Karbantartás mód",
    description: "Nem admin felhasználóknak minden oldal helyett a karbantartási oldal jelenik meg.",
    defaultEnabled: false,
  },
  {
    key: "glsParcelPicker",
    label: "GLS csomagpont választó",
    description: "Pénztárban GLS map picker megjelenítése.",
    defaultEnabled: false,
  },
  {
    key: "stripePayments",
    label: "Stripe fizetés",
    description: "Stripe alapú online kártyás fizetés engedélyezése.",
    defaultEnabled: false,
  },
  {
    key: "szamlazzInvoicing",
    label: "Automatikus számlázás",
    description: "Számlázz.hu/szamlazz.ts alapú automatikus számlázás.",
    defaultEnabled: false,
  },
];

export async function getAdminFeatureFlags() {
  await requireAdmin();
  await dbConnect();

  for (const flag of DEFAULT_FLAGS) {
    await FeatureFlag.findOneAndUpdate(
      { key: flag.key },
      {
        $setOnInsert: {
          key: flag.key,
          label: flag.label,
          description: flag.description,
          enabled: flag.defaultEnabled,
        },
      },
      { upsert: true, new: true }
    );
  }

  const flags = await FeatureFlag.find({}).sort({ key: 1 }).lean();
  return JSON.parse(JSON.stringify(flags));
}

export async function updateFeatureFlag(flagKey: string, enabled: boolean) {
  await requireAdmin();
  await dbConnect();

  await FeatureFlag.findOneAndUpdate(
    { key: flagKey },
    { enabled },
    { new: true }
  );

  revalidatePath("/admin/info");
}
