"use server";
// @ts-nocheck
const mq = { select:function(){return this}, eq:function(){return this}, order:function(){return this}, limit:function(){return this}, single:async function(){return {data:null,error:null}}, ilike:function(){return this}, returns:function(){return this}, then:function(cb){cb({data:[],error:null})} };
const createClient = async () => ({ from: () => mq, insert: () => mq, update: () => mq, delete: () => mq, auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;

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
