"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, Activity, Loader2, ArrowUpRight } from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getAdminMetrics, getAllOrdersAdmin, getProducts, getAdminMonthlySales } from "@/lib/api";
import type { Order } from "@/lib/types/order";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingOrdersCount: 0,
    totalPaidOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesChartData, setSalesChartData] = useState<Array<{ name: string; total: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [metricsRes, ordersRes, productsRes, salesRes] = await Promise.allSettled([
          getAdminMetrics(),
          getAllOrdersAdmin({ limit: 10 }),
          getProducts(),
          getAdminMonthlySales(6),
        ]);

        let totalRevenue = 0;
        let totalUsers = 0;
        let pendingOrdersCount = 0;
        let totalPaidOrders = 0;
        let activeProducts = 0;

        if (metricsRes.status === "fulfilled" && metricsRes.value?.data) {
          totalRevenue = metricsRes.value.data.totalRevenue || 0;
          totalUsers = metricsRes.value.data.totalUsers || 0;
          pendingOrdersCount = metricsRes.value.data.pendingOrdersCount || 0;
          totalPaidOrders = metricsRes.value.data.totalPaidOrders || 0;
        }

        if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
          activeProducts = productsRes.value.length;
        }

        if (ordersRes.status === "fulfilled" && ordersRes.value?.data?.orders) {
          const fetchedOrders = ordersRes.value.data.orders.filter(
            (o) => !((o.paymentMethod || '').toLowerCase() === 'payhere' && !o.isPaid)
          );
          setRecentOrders(fetchedOrders);
          if (totalRevenue === 0 && fetchedOrders.length > 0) {
            totalRevenue = fetchedOrders
              .filter((o) => o.isPaid)
              .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          }
        }

        if (salesRes.status === "fulfilled" && salesRes.value?.data && Array.isArray(salesRes.value.data)) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mapped = salesRes.value.data.map((item) => {
            const parts = (item.month || "").split("-");
            const idx = parseInt(parts[1], 10) - 1;
            const name = monthNames[idx] || item.month;
            return {
              name,
              total: item.totalRevenue || 0,
            };
          });
          setSalesChartData(mapped);
        }

        setMetrics({
          totalUsers,
          pendingOrdersCount,
          totalPaidOrders,
          totalRevenue,
          activeProducts,
        });
      } catch (err) {
        console.warn("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatDateWithTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (order: Order) => {
    if (order.isCancelled) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (order.isDelivered) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (order.isShipped) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (order.isPaid) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  };

  const getStatusText = (order: Order) => {
    if (order.isCancelled) return "CANCELLED";
    if (order.isDelivered) return "DELIVERED";
    if (order.isShipped) return "SHIPPED";
    if (order.isPaid) return "PAID";
    return "PENDING";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time business performance metrics, live order stream, and catalog health
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{formatPrice(metrics.totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered customer accounts</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics.pendingOrdersCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Requiring fulfillment / dispatch</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Catalog</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics.activeProducts}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Live products available</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Notifications Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-4 glass-card border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex-1 min-h-[300px]">
            <RevenueChart data={salesChartData} />
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-3 glass-card border-border/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
            <div className="space-y-4">
              {loading ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loading recent orders...</span>
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.slice(0, 8).map((order) => {
                  const customerName = (typeof order.user === "object" && order.user?.name)
                    || order.shippingAddress?.name
                    || "Guest User";

                  const rawId = order._id || order.id;

                  return (
                    <div
                      key={rawId}
                      className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <Link href={`/admin/orders/${rawId}`} className="text-sm font-semibold hover:underline">
                          {order.orderNumber || `ORD-${rawId}`}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {customerName} • {formatDateWithTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-bold text-sm">{formatPrice(order.totalPrice)}</div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border ${getStatusColor(order)}`}
                        >
                          {getStatusText(order)}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm space-y-2 py-12">
                  <ShoppingCart className="h-8 w-8 opacity-20" />
                  <p>No orders recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
