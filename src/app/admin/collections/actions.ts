"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCollectionAdmin, updateCollectionAdmin, deleteCollectionAdmin } from "@/lib/api";

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

export async function addCollection(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const image = (formData.get("image") as string) || "";

  if (!name || !name.trim()) {
    throw new Error("Collection name is required");
  }

  await createCollectionAdmin({ name, slug, description, image }, tokenVal);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/collections");
}

export async function updateCollection(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const image = (formData.get("image") as string) || "";

  if (!id) {
    throw new Error("Collection ID is required for update");
  }

  await updateCollectionAdmin(id, { name, slug, description, image }, tokenVal);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/collections");
}

export async function deleteCollection(formData: FormData, token?: string | null) {
  const tokenVal = await resolveToken(token, formData);
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Collection ID is required for deletion");
  }

  await deleteCollectionAdmin(id, tokenVal);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  revalidatePath("/");
}
