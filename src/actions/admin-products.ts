"use server"

import { ProductService } from "@/services/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import {
  deriveProductLevelFromVariants,
  resolveVariantNetPrice,
} from "@/lib/admin-product-variants";

type VariantOptionInput = { name: string; values: string[] };
type VariantInput = {
  id?: string;
  sku?: string;
  attributes?: Record<string, string>;
  nameOverride?: string;
  descriptionOverride?: string;
  netPrice?: number;
  grossPrice?: number;
  discount?: number;
  stock?: number;
  isActive?: boolean;
  isDefault?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

function parseJsonField<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sanitizeVariantOptions(input: VariantOptionInput[]): VariantOptionInput[] {
  return (input || [])
    .map((option) => ({
      name: String(option.name || "").trim(),
      values: Array.isArray(option.values)
        ? option.values.map((value) => String(value || "").trim()).filter(Boolean)
        : [],
    }))
    .filter((option) => option.name && option.values.length > 0);
}

function sanitizeVariants(
  input: VariantInput[],
  fallbackNetPrice: number
) {
  const rawVariants = Array.isArray(input) ? input : [];
  const sanitized = rawVariants.map((variant, index) => {
    const normalizedAttributes = Object.fromEntries(
      Object.entries(variant.attributes || {})
        .map(([key, value]) => [String(key).trim(), String(value || "").trim()])
        .filter(([key, value]) => Boolean(key) && Boolean(value))
    );
    const identitySource =
      variant.id ||
      Object.entries(normalizedAttributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}-${value}`)
        .join("-") ||
      `variant-${index + 1}`;
    const baseId = slugify(identitySource) || `variant-${index + 1}`;
    const netPrice = resolveVariantNetPrice(variant.netPrice, fallbackNetPrice);
    const grossRaw = Number(variant.grossPrice);
    const grossPrice =
      Number.isFinite(grossRaw) && grossRaw > 0 ? grossRaw : undefined;

    return {
      id: baseId,
      slugPart: baseId,
      sku: String(variant.sku || "").trim() || undefined,
      attributes: normalizedAttributes,
      nameOverride: String(variant.nameOverride || "").trim() || undefined,
      descriptionOverride: String(variant.descriptionOverride || "").trim() || undefined,
      netPrice,
      grossPrice,
      discount: Number(variant.discount ?? 0) || 0,
      stock: Number(variant.stock ?? 0) || 0,
      isActive: variant.isActive !== false,
      isDefault: Boolean(variant.isDefault),
      seo: {
        title: String(variant.seo?.title || "").trim() || undefined,
        description: String(variant.seo?.description || "").trim() || undefined,
        keywords: Array.isArray(variant.seo?.keywords)
          ? variant.seo?.keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
          : [],
      },
    };
  });

  const seenIds = new Map<string, number>();
  const values = sanitized.map((variant) => {
    const count = seenIds.get(variant.id) || 0;
    seenIds.set(variant.id, count + 1);
    if (count === 0) return variant;
    const suffixedId = `${variant.id}-${count + 1}`;
    return {
      ...variant,
      id: suffixedId,
      slugPart: suffixedId,
    };
  });
  const hasDefault = values.some((variant) => variant.isDefault);
  if (!hasDefault && values.length > 0) {
    values[0].isDefault = true;
  }
  return values;
}

function parseProductPricing(formData: FormData, variants: ReturnType<typeof sanitizeVariants>, variantsEnabled: boolean, requireVariantSelection: boolean) {
  let netPrice = parseFloat(formData.get("netPrice") as string) || 0;
  let stock = parseInt(formData.get("stock") as string, 10) || 0;
  let discount = parseFloat(formData.get("discount") as string) || 0;
  const grossRaw = parseFloat(String(formData.get("grossPrice") ?? ""));
  let grossPrice = Number.isFinite(grossRaw) && grossRaw > 0 ? grossRaw : undefined;

  if (variantsEnabled && requireVariantSelection && variants.length > 0) {
    const derived = deriveProductLevelFromVariants(
      variants.map((v) => ({
        id: v.id,
        attributes: v.attributes,
        netPrice: v.netPrice,
        grossPrice: v.grossPrice,
        discount: v.discount,
        stock: v.stock,
        isActive: v.isActive,
        isDefault: Boolean(v.isDefault),
      }))
    );
    netPrice = derived.netPrice;
    stock = derived.stock;
    discount = derived.discount;
    if (derived.grossPrice > 0) grossPrice = derived.grossPrice;
  }

  return { netPrice, stock, discount, grossPrice };
}

async function persistProduct(
  mode: "create" | "update",
  id: string | undefined,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const images = formData.getAll("images") as string[];
  const vatPercent =
    Math.min(100, Math.max(0, Math.round(parseFloat(String(formData.get("vatPercent"))) || 27))) || 27;
  const category = formData.get("category") as string;
  const slug = slugify(name);

  const isActive = formData.get("isActive") === "true";
  const isVisible = formData.get("isVisible") === "true";
  const featuredRaw = String(formData.get("featuredListIndex") ?? "").trim();
  const featuredListIndex =
    featuredRaw === ""
      ? null
      : Number.isFinite(Number(featuredRaw))
        ? Math.round(Number(featuredRaw))
        : null;

  const seo = {
    title: (formData.get("seo_title") as string) || name,
    description: (formData.get("seo_description") as string) || description.substring(0, 160),
    keywords: ((formData.get("seo_keywords") as string) || "").split(",").map((k) => k.trim()),
  };

  const variantsEnabledInput = formData.get("variantsEnabled") === "true";
  const requireVariantSelection = formData.get("requireVariantSelection") === "true";
  const variantOptionsInput = parseJsonField<VariantOptionInput[]>(
    formData.get("variantOptionsJson"),
    []
  );
  const variantsInput = parseJsonField<VariantInput[]>(formData.get("variantsJson"), []);
  const hasVariantPayload = Array.isArray(variantsInput) && variantsInput.length > 0;
  const variantsEnabled = variantsEnabledInput || hasVariantPayload;
  const variantOptions = variantsEnabled ? sanitizeVariantOptions(variantOptionsInput) : [];

  const preNet = parseFloat(formData.get("netPrice") as string) || 0;
  const variants = variantsEnabled ? sanitizeVariants(variantsInput, preNet) : [];

  if (variantsEnabled && variants.length === 0) {
    throw new Error("A variáns termékhez legalább egy variáns kötelező.");
  }

  const { netPrice, stock, discount, grossPrice } = parseProductPricing(
    formData,
    variants,
    variantsEnabled,
    requireVariantSelection
  );

  const payload = {
    name,
    description,
    images,
    stock,
    netPrice,
    grossPrice,
    vatPercent,
    discount,
    category: category as any,
    seo,
    variantOptions,
    variants,
    requireVariantSelection: variantsEnabled ? requireVariantSelection : false,
    isActive,
    isVisible,
    featuredListIndex,
  };

  if (mode === "create") {
    await ProductService.create({ ...payload, slug });
  } else {
    await ProductService.update(id!, { ...payload, slug: slugify(name) });
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  try {
    await persistProduct("create", undefined, formData);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  try {
    await persistProduct("update", id, formData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    await ProductService.delete(id);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
