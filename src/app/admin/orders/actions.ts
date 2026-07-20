"use server";
// @ts-nocheck
const mq = { select:function(){return this}, eq:function(){return this}, order:function(){return this}, limit:function(){return this}, single:async function(){return {data:null,error:null}}, ilike:function(){return this}, returns:function(){return this}, then:function(cb: any){cb({data:[],error:null})} };
const createClient = async () => ({ from: () => mq, insert: () => mq, update: () => mq, delete: () => mq, auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
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
