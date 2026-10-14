"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { getMyOrders, updateUserProfile, cancelOrder, generatePayHereHash, confirmPayment, ApiError } from "@/lib/api";

import type { Order } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  User,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

declare global {
  interface Window {
    payhere?: {
      startPayment?: (payment: any) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: any) => void;
    };
  }
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "profile" ? "profile" : "orders";

  const { user, isAuthenticated, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">(initialTab);

  useEffect(() => {
    if (tabParam === "profile" || tabParam === "orders") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Cancel order modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingSubmitting, setCancellingSubmitting] = useState(false);

  // PayHere retry state
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?next=/account");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phoneNumber || "");
      setProfileAddress(user.address_line1 || "");
    }
  }, [user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getMyOrders(1, 50);
      const list = res.data?.orders || [];
      setOrders(list);
    } catch (err: any) {
      console.warn("Error fetching user orders:", err);
      toast.error(err instanceof ApiError ? err.message : "Failed to load order history.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthenticated) {
      fetchOrders();
    }
  }, [mounted, isAuthenticated]);

  if (!mounted) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await updateUserProfile({
        name: profileName.trim(),
        phoneNumber: profilePhone.trim(),
        address_line1: profileAddress.trim(),
      });

      if (res.data) {
        setUser(res.data);
      }
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    setCancellingSubmitting(true);

    try {
      await cancelOrder(cancellingOrderId, cancelReason || "Customer requested cancellation");
      toast.success("Order cancelled successfully. A cancellation notice has been emailed to you.");
      setCancellingOrderId(null);
      setCancelReason("");
      await fetchOrders();
    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Failed to cancel order.");
    } finally {
      setCancellingSubmitting(false);
    }
  };

  const handleRetryPayment = async (order: Order) => {
    const rawId = order._id || order.id;
    setRetryingOrderId(rawId);

    try {
      if (typeof window === "undefined" || !window.payhere || typeof window.payhere.startPayment !== "function") {
        toast.error("PayHere gateway is currently initializing. Please try again in a few moments.");
        setRetryingOrderId(null);
        return;
      }

      // Internal store cart prices are stored in minor units (cents, x100).
      // PayHere payment gateway requires major currency units (decimal Rupees, e.g. 425000.00).
      const payhereAmountInRupees = Number((order.totalPrice / 100).toFixed(2));

      const hashRes = await generatePayHereHash({
        order_id: String(rawId),
        amount: payhereAmountInRupees,
        currency: "LKR",
      });

      const hashData = (hashRes as any).data || hashRes;

      const customerFirstName = order.shippingAddress?.name?.split(" ")[0]
        || (typeof order.user === "object" ? order.user?.name?.split(" ")[0] : "Customer")
        || "Customer";
      const customerLastName = order.shippingAddress?.name?.split(" ").slice(1).join(" ") || "";
      const customerEmail = order.shippingAddress?.email
        || (typeof order.user === "object" ? order.user?.email : "")
        || user?.email
        || "";

      const payhereConfig = {
        sandbox: true,
        merchant_id: hashData.merchant_id || "",
        return_url: `${window.location.origin}/account?tab=orders`,
        cancel_url: `${window.location.origin}/account?tab=orders`,
        notify_url: `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/payments/notify`,

        order_id: hashData.order_id,
        items: order.orderItems?.map((i) => i.name).join(", ") || "GadgetZone Order",
        amount: hashData.amount,
        currency: hashData.currency || "LKR",
        hash: hashData.hash,
        first_name: customerFirstName,
        last_name: customerLastName,
        email: customerEmail,
        phone: order.shippingAddress?.phone || user?.phoneNumber || "",
        address: order.shippingAddress?.address || "",
        city: order.shippingAddress?.city || "",
        country: "Sri Lanka",
      };

      const payhereInstance = typeof window !== "undefined" ? (window as any).payhere : null;
      if (payhereInstance) {
        payhereInstance.onCompleted = async function onCompleted(orderId: string) {
          try {
            const targetOrderId = String(rawId) || orderId;
            if (targetOrderId) {
              await confirmPayment(targetOrderId);
            }
          } catch (confirmErr) {
            console.warn("Could not confirm payment on server:", confirmErr);
          }
          toast.success("Payment completed successfully!");
          setRetryingOrderId(null);
          await fetchOrders();
        };

        payhereInstance.onDismissed = function onDismissed() {
          toast.info("Payment window closed. You can retry paying whenever you're ready.");
          setRetryingOrderId(null);
        };

        payhereInstance.onError = function onError(error: any) {
          toast.error(`Payment processing error: ${error || 'Payment failed'}`);
          setRetryingOrderId(null);
        };

        payhereInstance.startPayment(payhereConfig);
        return;
      }

    } catch (err: any) {
      toast.error(err instanceof ApiError ? err.message : "Failed to initiate payment retry.");
      setRetryingOrderId(null);
    }
  };

  const getOrderStatusBadge = (order: Order) => {
    if (order.isCancelled) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
          <XCircle className="h-3 w-3" /> Cancelled
        </Badge>
      );
    }
    if (order.isDelivered) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </Badge>
      );
    }
    if (order.isShipped) {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1">
          <Truck className="h-3 w-3" /> In Transit
        </Badge>
      );
    }
    if (order.isPaid) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1">
          <Clock className="h-3 w-3" /> Processing (Paid)
        </Badge>
      );
    }
    // PayHere failed or uncompleted payments
    if ((order.paymentMethod || '').toLowerCase() === 'payhere' || order.paymentResult?.status === 'FAILED') {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 font-semibold">
          <AlertCircle className="h-3 w-3 text-destructive" /> Payment Failed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1">
        <Clock className="h-3 w-3" /> Confirmed (Pending Payment)
      </Badge>
    );
  };

  return (
    <>
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="lazyOnload" />
      <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
      {/* Header Info Banner */}
      <div className="glass-card rounded-2xl border border-border/50 p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase ring-4 ring-primary/5">
            {user.name ? user.name.slice(0, 2) : "ME"}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {user.name}
              {user.isEmailVerified && (
                <span title="Email Verified" className="text-green-500">
                  <ShieldCheck className="h-5 w-5" />
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.isAdmin && (
              <Badge variant="secondary" className="mt-1 font-semibold text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            className="rounded-full flex-1 md:flex-initial gap-2"
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-4 w-4" />
            My Orders ({orders.length})
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            className="rounded-full flex-1 md:flex-initial gap-2"
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4" />
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Tab 1: Orders & Tracking */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Order History & Tracking</h2>
              <p className="text-sm text-muted-foreground">
                Track your active shipments, delivery status, and invoice history
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <ShoppingBag className="h-4 w-4" />
                Browse Store
              </Button>
            </Link>
          </div>

          {ordersLoading ? (
            <div className="glass-card rounded-2xl border border-border/50 p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card rounded-2xl border border-border/50 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold">No Orders Placed Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                When you order tech gadgets, audio gear, or accessories, they will show up here with live courier tracking.
              </p>
              <Link href="/shop">
                <Button className="rounded-full mt-2">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const canCancel = !order.isShipped && !order.isDelivered && !order.isCancelled;
                const isPayHereOrder = (order.paymentMethod || '').toLowerCase() === 'payhere';
                const canRetryPayment = isPayHereOrder && !order.isPaid && !order.isCancelled;

                return (
                  <Card key={order._id || order.id} className="border-border/50 glass-card overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-primary">
                              {order.orderNumber || `ORD-${order._id}`}
                            </span>
                            {getOrderStatusBadge(order)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold">{formatPrice(order.totalPrice)}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Payment: {order.paymentMethod} • {order.isPaid ? "Paid" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      {/* Tracking banner if shipped */}
                      {order.trackingInfo && (
                        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-purple-500 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                                Courier: {order.trackingInfo.carrier}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                Tracking #: <span className="font-bold text-foreground">{order.trackingInfo.trackingNumber}</span>
                              </p>
                            </div>
                          </div>
                          {order.trackingInfo.shippedAt && (
                            <span className="text-[11px] text-muted-foreground">
                              Dispatched: {new Date(order.trackingInfo.shippedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Items List */}
                      <div className="divide-y divide-border/20">
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {item.imageUrl ? (
                                <div className="relative h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                              </div>
                            </div>
                            <div className="font-semibold text-sm">
                              {formatPrice(item.price * item.qty)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address & Actions Footer */}
                      <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground">Delivery to: </span>
                          {order.shippingAddress?.address}, {order.shippingAddress?.city}
                        </div>

                        <div className="flex items-center gap-2">
                          {canRetryPayment && (
                            <Button
                              variant="default"
                              size="sm"
                              className="rounded-full text-xs h-8 px-4 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                              disabled={retryingOrderId === (order._id || order.id)}
                              onClick={() => handleRetryPayment(order)}
                            >
                              {retryingOrderId === (order._id || order.id) ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Retrying...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-3.5 w-3.5" /> Try to Pay Again
                                </>
                              )}
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full text-xs h-8 px-4"
                              onClick={() => {
                                setCancellingOrderId(order._id);
                                setCancelReason("");
                              }}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === "profile" && (
        <Card className="border-border/50 glass-card">
          <CardHeader>
            <CardTitle>Profile & Shipping Defaults</CardTitle>
            <CardDescription>
              Keep your contact details and shipping address updated for quick one-click checkouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="prof-name">Full Name</Label>
                <Input
                  id="prof-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-email">Email Address</Label>
                <Input
                  id="prof-email"
                  value={user.email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Your email is managed via your secure login credential.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-phone">Phone Number</Label>
                <Input
                  id="prof-phone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="077 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-addr">Default Delivery Address</Label>
                <Input
                  id="prof-addr"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="123 Galle Road, Colombo 03"
                />
              </div>

              <Button type="submit" disabled={profileSaving} className="rounded-full px-6">
                {profileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Cancel Order Dialog Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-border glass-card shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" /> Cancel Order
              </CardTitle>
              <CardDescription>
                Are you sure you want to cancel this order? Once cancelled, reserved stock will be returned to the store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                  <Input
                    id="cancel-reason"
                    placeholder="e.g., Ordered wrong color, found alternative, etc."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                    disabled={cancellingSubmitting}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCancellingOrderId(null)}
                    disabled={cancellingSubmitting}
                  >
                    Keep Order
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={cancellingSubmitting || !cancelReason.trim()}
                  >
                    {cancellingSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Confirm Cancellation"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </>
);
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading account...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
