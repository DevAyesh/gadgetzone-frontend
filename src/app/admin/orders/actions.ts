"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function updateOrderStatus(
  orderId: string,
  status: string,
  details: { carrier?: string; trackingNumber?: string; reason?: string } = {},
  token?: string | null
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let endpoint = "";
    const method = "PUT";
    let body: any = {};

    switch (status.toLowerCase()) {
      case "processing":
      case "paid":
        endpoint = `/api/orders/${encodeURIComponent(orderId)}/pay`;
        body = { paymentResult: { status: "COMPLETED", id: `PAY-${Date.now()}` } };
        break;

      case "shipped":
        endpoint = `/api/orders/${encodeURIComponent(orderId)}/ship`;
        body = {
          carrier: details.carrier || "Certis Lanka Courier",
          trackingNumber: details.trackingNumber || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        };
        break;

      case "delivered":
        endpoint = `/api/orders/${encodeURIComponent(orderId)}/deliver`;
        body = { isDelivered: true };
        break;

      case "cancelled":
        endpoint = `/api/orders/${encodeURIComponent(orderId)}/cancel`;
        body = { reason: details.reason || "Cancelled by administrator" };
        break;

      default:
        return { success: false, error: `Status "${status}" cannot be set directly or is not supported.` };
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || `Failed with status ${res.status}` };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateOrderStatus action:", error);
    return { success: false, error: error.message || "Failed to update order status" };
  }
}
