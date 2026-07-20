// @ts-nocheck
const createClient = async () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }), order: () => ({ data: [] }), returns: () => ({ data: [] }) }), order: () => ({ data: [] }), single: () => ({ data: null }), ilike: () => ({ data: [] }), limit: () => ({ data: [] }) }), insert: () => ({ select: () => ({ single: () => ({ error: null, data: null }) }), error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }), auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addCollection(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const { error } = await supabase.from("collections").insert({
    name,
    slug
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  redirect("/admin/collections");
}

export async function updateCollection(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  const { error } = await supabase.from("collections").update({
    name,
    slug
  }).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
  redirect("/admin/collections");
}

export async function deleteCollection(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/collections");
  revalidatePath("/shop");
}
