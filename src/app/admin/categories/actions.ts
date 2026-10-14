"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin } from "@/lib/api";

async function resolveToken(token?: string | null, formData?: FormData): Promise<string | null> {
  if (token) return token;
  const formToken = formData?.get("token") as string | null;
  if (formToken) return formToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get("token")?.value || null;
  } catch {
    return null;
  }
}

export async function addCategory(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon = (formData.get("icon") as string) || "📦";

  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  await createCategoryAdmin({ name, slug, icon }, tokenVal);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon = (formData.get("icon") as string) || "📦";

  if (!id) {
    throw new Error("Category ID is required for update");
  }

  await updateCategoryAdmin(id, { name, slug, icon }, tokenVal);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Category ID is required for deletion");
  }

  await deleteCategoryAdmin(id, tokenVal);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
}
