"use server";
// @ts-nocheck
const createClient = async () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }), order: () => ({ data: [] }), returns: () => ({ data: [] }) }), order: () => ({ data: [] }), single: () => ({ data: null }), ilike: () => ({ data: [] }), limit: () => ({ data: [] }) }), insert: () => ({ select: () => ({ single: () => ({ error: null, data: null }) }), error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }), auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;

import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}
