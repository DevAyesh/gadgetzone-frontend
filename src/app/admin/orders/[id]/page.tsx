"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Package, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderStatusUpdate } from "@/components/admin/order-status-update";
import { getOrderById, ApiError } from "@/lib/api";
import type { Order } from "@/lib/types/order";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await getOrderById(orderId);
      if (res.data) {
        setOrder(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to fetch order details:", err);
      toast.error(err instanceof ApiError ? err.message : "Failed to fetch order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">The requested order does not exist or was removed.</p>
        <Link href="/admin/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const customerName = (typeof order.user === "object" && order.user?.name)
    || order.shippingAddress?.name
    || "Customer";
  const customerEmail = (typeof order.user === "object" && order.user?.email)
    || order.shippingAddress?.email
    || "N/A";
  const customerPhone = order.shippingAddress?.phone || "N/A";

  const orderDate = new Date(order.createdAt).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let currentStatus = "pending";
  if (order.isCancelled) currentStatus = "cancelled";
  else if (order.isDelivered) currentStatus = "delivered";
  else if (order.isShipped) currentStatus = "shipped";
  else if (order.isPaid) currentStatus = "processing";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Order <span className="text-primary">{order.orderNumber || `ORD-${order._id}`}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Placed on {orderDate}</p>
        </div>

        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="bg-muted/50 gap-2 font-medium rounded-full">
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>

      {/* Tracking Callout */}
      {order.trackingInfo && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Shipped via {order.trackingInfo.carrier}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Tracking Number: <span className="font-bold text-foreground">{order.trackingInfo.trackingNumber}</span>
              </p>
            </div>
          </div>
          {order.trackingInfo.shippedAt && (
            <span className="text-xs text-muted-foreground">
              Dispatched at {new Date(order.trackingInfo.shippedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* 3-Column Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 glass-card p-6 rounded-2xl border border-border/50">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Customer</h3>
          <p className="font-semibold text-foreground text-sm">{customerName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{customerEmail}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Phone: {customerPhone}</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.shippingAddress?.address || order.shippingAddress?.addressLine1 || "N/A"}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
            {order.shippingAddress?.country || "Sri Lanka"}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Details</h3>
          <p className="font-semibold capitalize text-foreground text-sm flex items-center gap-2">
            {order.paymentMethod}
            {order.isPaid ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                Paid
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px]">
                Unpaid
              </Badge>
            )}
          </p>
          {order.paymentResult?.payhere_payment_id && (
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              PayHere ID: {order.paymentResult.payhere_payment_id}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/30">
          <h2 className="text-sm font-semibold">Ordered Items ({order.orderItems?.length || 0})</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/20">
              <th className="p-4">Product</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {order.orderItems?.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  {item.imageUrl ? (
                    <div className="relative h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-medium text-sm">{item.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{item.qty}</td>
                <td className="p-4 text-muted-foreground">{formatPrice(item.price)}</td>
                <td className="p-4 text-right font-semibold">{formatPrice(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="glass-card rounded-2xl border border-border/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Order Value</span>
          <h2 className="text-3xl font-extrabold text-foreground">
            {formatPrice(order.totalPrice)}
          </h2>
        </div>

        <OrderStatusUpdate
          orderId={order._id || order.id}
          currentStatus={currentStatus}
        />
      </div>

      {/* Cancellation Banner if Cancelled */}
      {order.isCancelled && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm flex items-center gap-2">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>
            <strong>Order Cancelled: </strong>
            {order.cancelReason || "No specific reason provided."}
          </span>
        </div>
      )}
    </div>
  );
}
