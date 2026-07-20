// @ts-nocheck
const createClient = async () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }), order: () => ({ data: [] }), returns: () => ({ data: [] }) }), order: () => ({ data: [] }), single: () => ({ data: null }), ilike: () => ({ data: [] }), limit: () => ({ data: [] }) }), insert: () => ({ select: () => ({ single: () => ({ error: null, data: null }) }), error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }), auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addCategory(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon = formData.get("icon") as string;

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    icon
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const icon = formData.get("icon") as string;

  const { error } = await supabase.from("categories").update({
    name,
    slug,
    icon
  }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
