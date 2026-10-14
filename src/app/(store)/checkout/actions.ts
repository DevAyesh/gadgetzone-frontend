"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  paymentMethod: string;
}

export interface PayHereCheckoutParams {
  merchant_id: string;
  order_id: string;
  amount: string;
  currency: string;
  hash: string;
}

export async function processCheckout(
  formData: CheckoutFormData,
  cartItems: any[],
  totalAmount: number,
  token?: string | null
) {
  const customerName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Customer';
  let orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  const mappedOrderItems = (cartItems || []).map((item) => ({
    product: item.id || item._id,
    id: item.id || item._id,
    qty: item.quantity || item.qty || 1,
    name: item.name,
    price: item.price,
    imageUrl: item.image_url || item.imageUrl || '',
  }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: formData.email,
        name: customerName,
        orderItems: mappedOrderItems,
        shippingAddress: {
          name: customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: "LK",
        },
        paymentMethod: formData.paymentMethod,
        totalPrice: totalAmount,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Order creation failed with status ${res.status}`,
      };
    }

    const responseData = await res.json().catch(() => ({}));
    const orderObj = responseData.data || responseData;
    const orderId = orderObj._id || orderObj.id;

    if (responseData.orderNumber) {
      orderNumber = responseData.orderNumber;
    } else if (orderObj.orderNumber) {
      orderNumber = orderObj.orderNumber;
    } else if (orderId) {
      orderNumber = `ORD-${orderId}`;
    }

    let payhereParams: PayHereCheckoutParams | null = null;

    // If PayHere payment method selected, fetch checkout hash
    if (formData.paymentMethod === 'payhere' && orderId) {
      try {
        // Internal store cart prices are stored in minor units (cents, x100).
        // PayHere payment gateway requires major currency units (decimal Rupees, e.g. 425000.00).
        const payhereAmountInRupees = Number((totalAmount / 100).toFixed(2));

        const hashRes = await fetch(`${API_URL}/api/payments/hash`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            order_id: String(orderId),
            amount: payhereAmountInRupees,
            currency: "LKR",
          }),
        });

        if (hashRes.ok) {
          const hashData = await hashRes.json();
          payhereParams = hashData.data || hashData;
        }
      } catch (hashErr) {
        console.warn("PayHere hash generation warning:", hashErr);
      }
    }

    return {
      success: true,
      orderNumber,
      orderId,
      payhereParams,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred during checkout",
    };
  }
}
