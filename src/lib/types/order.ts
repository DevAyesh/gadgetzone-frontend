export interface OrderItem {
  name: string;
  qty: number;
  imageUrl?: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  addressLine1?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  shippedAt?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    email?: string;
  } | string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    payhere_payment_id?: string;
  };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string | null;
  isDelivered: boolean;
  deliveredAt?: string | null;
  isShipped: boolean;
  shippedAt?: string | null;
  isCancelled: boolean;
  cancelledAt?: string | null;
  cancelReason?: string;
  trackingInfo?: TrackingInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  success: boolean;
  message?: string;
  data: {
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface AdminMetricsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    pendingOrdersCount: number;
    totalPaidOrders: number;
    totalRevenue: number;
  };
}

export interface PayHereHashResponse {
  success: boolean;
  data: {
    merchant_id: string;
    order_id: string;
    amount: string;
    currency: string;
    hash: string;
  };
}
