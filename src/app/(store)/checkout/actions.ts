"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export async function processCheckout(
  formData: CheckoutFormData,
  cartItems: any[],
  totalAmount: number
) {
  // TODO: Get user token from cookie/header for authenticated orders
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderItems: cartItems,
      shippingAddress: {
        address: formData.addressLine1,
        city: formData.city,
        postalCode: "",
        country: "LK",
      },
      paymentMethod: formData.paymentMethod,
      totalPrice: totalAmount,
    }),
  });

  if (!res.ok) {
    return { success: false, error: "Failed to create order" };
  }

  return { success: true, orderNumber };
}
