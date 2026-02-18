"use server"

import { ProductService } from "@/services/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const images = formData.getAll("images") as string[];
  const stock = parseInt(formData.get("stock") as string) || 0;
  const netPrice = parseFloat(formData.get("netPrice") as string) || 0;
  const discount = parseFloat(formData.get("discount") as string) || 0;
  const category = formData.get("category") as string;
  const slug = slugify(name);
  
  const isActive = formData.get("isActive") === "true";
  const isVisible = formData.get("isVisible") === "true";

  const seo = {
    title: (formData.get("seo_title") as string) || name,
    description: (formData.get("seo_description") as string) || (description.substring(0, 160)),
    keywords: (formData.get("seo_keywords") as string || "").split(",").map(k => k.trim()),
  };

  try {
    await ProductService.create({
      name,
      description,
      images,
      stock,
      netPrice,
      discount,
      category: category as any,
      slug,
      seo,
      isActive,
      isVisible
    });
  } catch (error) {
    console.error("Error creating product:", error);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const images = formData.getAll("images") as string[];
  const stock = parseInt(formData.get("stock") as string) || 0;
  const netPrice = parseFloat(formData.get("netPrice") as string) || 0;
  const discount = parseFloat(formData.get("discount") as string) || 0;
  const category = formData.get("category") as string;

  const isActive = formData.get("isActive") === "true";
  const isVisible = formData.get("isVisible") === "true";

  const seo = {
    title: (formData.get("seo_title") as string) || name,
    description: (formData.get("seo_description") as string) || (description.substring(0, 160)),
    keywords: (formData.get("seo_keywords") as string || "").split(",").map(k => k.trim()),
  };

  try {
    await ProductService.update(id, {
      name,
      description,
      images,
      stock,
      netPrice,
      slug: slugify(name),
      discount,
      category: category as any,
      seo,
      isActive,
      isVisible
    });
  } catch (error) {
    console.error("Error updating product:", error);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}


export async function deleteProduct(id: string) {
  try {
    await ProductService.delete(id);
  } catch (error) {
    console.error("Error deleting product:", error);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
