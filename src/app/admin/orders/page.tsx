"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Search, Loader2, Package, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { getAllOrdersAdmin, ApiError } from "@/lib/api";
import type { Order } from "@/lib/types/order";
import { toast } from "sonner";

function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOrdersAdmin({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        limit: 50,
      });

      const list = res.data?.orders || [];
      setOrders(list);
    } catch (err: any) {
      console.warn("Failed to fetch admin orders:", err);
      toast.error(err instanceof ApiError ? err.message : "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter((o) => {
    // Exclude unpaid/failed PayHere orders from admin list
    const isPayHereUnpaid = (o.paymentMethod || '').toLowerCase() === 'payhere' && !o.isPaid;
    if (isPayHereUnpaid) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const orderNo = (o.orderNumber || o._id || "").toLowerCase();
    const custName = (typeof o.user === "object" ? o.user?.name : "") || o.shippingAddress?.name || "";
    const custEmail = (typeof o.user === "object" ? o.user?.email : "") || o.shippingAddress?.email || "";
    return orderNo.includes(term) || custName.toLowerCase().includes(term) || custEmail.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage store orders, trigger live courier dispatches, and track fulfillment
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="gap-2 rounded-full"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order ID, name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background/50 text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background/50 border border-border/50 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const customerName = (typeof order.user === "object" && order.user?.name)
                  || order.shippingAddress?.name
                  || "Customer";
                const customerEmail = (typeof order.user === "object" && order.user?.email)
                  || order.shippingAddress?.email
                  || "";

                const orderDisplayId = order.orderNumber || `ORD-${order._id}`;
                const rawId = order._id || order.id;

                let currentStatus = "pending";
                if (order.isCancelled) currentStatus = "cancelled";
                else if (order.isDelivered) currentStatus = "delivered";
                else if (order.isShipped) currentStatus = "shipped";
                else if (order.isPaid) currentStatus = "processing";

                return (
                  <TableRow key={rawId}>
                    <TableCell className="font-mono font-bold text-primary">
                      <Link href={`/admin/orders/${rawId}`} className="hover:underline">
                        {orderDisplayId}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{customerName}</span>
                        <span className="text-xs text-muted-foreground">{customerEmail}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    <TableCell className="font-bold text-sm">
                      {formatPrice(order.totalPrice)}
                    </TableCell>

                    <TableCell>
                      {order.trackingInfo ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {order.trackingInfo.carrier}
                          </span>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            {order.trackingInfo.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="w-[140px]">
                        <OrderStatusSelect
                          orderId={rawId}
                          currentStatus={currentStatus}
                          onStatusUpdated={fetchOrders}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${rawId}`}>
                        <Button variant="outline" size="sm" className="gap-2 rounded-full h-8">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 opacity-40" />
                    <span>No orders found matching criteria.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading orders page...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
