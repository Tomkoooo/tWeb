"use server"

import { CategoryService } from "@/services/category";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const parent = formData.get("parent") as string || null;
  const image = formData.get("image") as string || "";
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  const seo = {
    title: formData.get("seo_title") as string || name,
    description: formData.get("seo_description") as string || "",
    keywords: (formData.get("seo_keywords") as string || "").split(",").map(k => k.trim()),
  };

  try {
    await CategoryService.create({
      name,
      parent: parent as any,
      image,
      slug,
      seo
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const parent = formData.get("parent") as string || null;
  const image = formData.get("image") as string || "";

  const seo = {
    title: formData.get("seo_title") as string || name,
    description: formData.get("seo_description") as string || "",
    keywords: (formData.get("seo_keywords") as string || "").split(",").map(k => k.trim()),
  };

  try {
    await CategoryService.update(id, {
      name,
      parent: parent as any,
      image,
      seo
    });
  } catch (error) {
    console.error("Error updating category:", error);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  try {
    await CategoryService.delete(id);
  } catch (error) {
    console.error("Error deleting category:", error);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

