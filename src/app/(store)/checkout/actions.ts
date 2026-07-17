"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  phone: string;
  paymentMethod: string;
}

export async function processCheckout(formData: CheckoutFormData, cartItems: any[], totalAmount: number) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id || null;

  // Initialize admin client to bypass RLS for insertions
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
    return { success: false, error: "Server misconfiguration. Please contact support." };
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Generate Order Number
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      total_amount: totalAmount,
      status: "pending",
      payment_method: formData.paymentMethod,
      notes: `Shipping Info: ${formData.firstName} ${formData.lastName}, ${formData.addressLine1}, ${formData.city}. Phone: ${formData.phone}. Email: ${formData.email}`
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order creation failed:", orderError);
    return { success: false, error: "Failed to create order" };
  }

  // 3. Insert Order Items
  const orderItems = cartItems.map((item) => {
    // Check if the item.id is a valid UUID (fallback products have IDs like "0" or "1")
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id);
    
    return {
      order_id: order.id,
      product_id: isValidUUID ? item.id : null,
      quantity: item.quantity,
      price: item.price
    };
  });

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items creation failed:", itemsError);
    return { success: false, error: `Failed to add items: ${itemsError.message}` };
  }

  return { success: true, orderNumber: order.order_number };
}
