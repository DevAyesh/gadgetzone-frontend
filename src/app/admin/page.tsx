"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { RevenueChart, type ChartDataPoint } from "@/components/admin/revenue-chart";
import { OrderStatusOverview } from "@/components/admin/order-status-overview";
import { InventoryOverview } from "@/components/admin/inventory-overview";
import { TopSellingProducts } from "@/components/admin/top-selling-products";
import { formatPrice } from "@/lib/utils";
import {
  getAdminMetrics,
  getAllOrdersAdmin,
  getProducts,
  getAdminDailySales,
  getAdminTopSellingProducts,
  type TopSellingProduct,
} from "@/lib/api";
import type { Order } from "@/lib/types/order";
import type { CustomerProduct } from "@/lib/types/customer";
import Link from "next/link";

type DateRangeOption = 7 | 30 | 90;

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingOrdersCount: 0,
    totalPaidOrders: 0,
    totalRevenue: 0,
    totalOrdersCount: 0,
    activeProducts: 0,
    totalProducts: 0,
    outOfStockCount: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CustomerProduct[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [salesRange, setSalesRange] = useState<DateRangeOption>(30);
  const [salesChartData, setSalesChartData] = useState<ChartDataPoint[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  /**
   * Helper to build a continuous, accurate date timeline
   * Fills zero-revenue periods honestly rather than skipping days.
   */
  const buildTimeline = useCallback(
    (days: number, salesList: Array<{ date: string; totalRevenue: number; orderCount: number }>) => {
      const salesMap = new Map<string, { totalRevenue: number; orderCount: number }>();
      salesList.forEach((item) => {
        if (item.date) salesMap.set(item.date, item);
      });

      const timeline: ChartDataPoint[] = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);

        // Format to YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        const match = salesMap.get(dateKey);

        const shortLabel = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const fullDateLabel = d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        timeline.push({
          name: shortLabel,
          rawDate: fullDateLabel,
          total: match ? match.totalRevenue : 0,
          orders: match ? match.orderCount : 0,
        });
      }

      return timeline;
    },
    []
  );

  /**
   * Fetch sales chart data for the selected range
   */
  const fetchSalesData = useCallback(
    async (days: DateRangeOption) => {
      setChartLoading(true);
      try {
        const res = await getAdminDailySales(days);
        const dataList = res?.data && Array.isArray(res.data) ? res.data : [];
        const formatted = buildTimeline(days, dataList);
        setSalesChartData(formatted);
      } catch (err) {
        console.warn("Failed to fetch daily sales data:", err);
      } finally {
        setChartLoading(false);
      }
    },
    [buildTimeline]
  );

  /**
   * Load all core dashboard data
   */
  const loadDashboardData = useCallback(async () => {
    try {
      const [metricsRes, ordersRes, productsRes, salesRes, topRes] = await Promise.allSettled([
        getAdminMetrics(),
        getAllOrdersAdmin({ limit: 12 }),
        getProducts({ cache: "no-store" }),
        getAdminDailySales(salesRange),
        getAdminTopSellingProducts(5),
      ]);

      let totalRevenue = 0;
      let totalUsers = 0;
      let pendingOrdersCount = 0;
      let totalPaidOrders = 0;
      let totalOrdersCount = 0;

      let activeProducts = 0;
      let totalProducts = 0;
      let outOfStockCount = 0;

      if (metricsRes.status === "fulfilled" && metricsRes.value?.data) {
        totalRevenue = metricsRes.value.data.totalRevenue || 0;
        totalUsers = metricsRes.value.data.totalUsers || 0;
        pendingOrdersCount = metricsRes.value.data.pendingOrdersCount || 0;
        totalPaidOrders = metricsRes.value.data.totalPaidOrders || 0;
      }

      if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
        const prodList = productsRes.value;
        setCatalogProducts(prodList);
        totalProducts = prodList.length;
        activeProducts = prodList.filter((p: any) => !p.isRemoved).length;
        outOfStockCount = prodList.filter((p) => {
          const qty = p.countInStock !== undefined && p.countInStock !== null ? p.countInStock : (p.stock || 0);
          return qty <= 0;
        }).length;
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        const fetchedOrders = (ordersRes.value.data.orders || []).filter(
          (o) => !((o.paymentMethod || "").toLowerCase() === "payhere" && !o.isPaid)
        );
        setRecentOrders(fetchedOrders);
        totalOrdersCount = ordersRes.value.data.pagination?.total || fetchedOrders.length;

        // Fallback revenue calculation if metrics endpoint is empty
        if (totalRevenue === 0 && fetchedOrders.length > 0) {
          totalRevenue = fetchedOrders
            .filter((o) => o.isPaid)
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        }
      }

      if (salesRes.status === "fulfilled" && salesRes.value?.data && Array.isArray(salesRes.value.data)) {
        const formatted = buildTimeline(salesRange, salesRes.value.data);
        setSalesChartData(formatted);
      }

      if (topRes.status === "fulfilled" && topRes.value?.data && Array.isArray(topRes.value.data)) {
        setTopProducts(topRes.value.data);
      }

      setMetrics({
        totalUsers,
        pendingOrdersCount,
        totalPaidOrders,
        totalRevenue,
        totalOrdersCount,
        activeProducts,
        totalProducts,
        outOfStockCount,
      });

      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Error loading admin dashboard:", err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [salesRange, buildTimeline]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRangeChange = (range: DateRangeOption) => {
    if (range === salesRange) return;
    setSalesRange(range);
    fetchSalesData(range);
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatDateWithTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getFulfillmentBadge = (order: Order) => {
    if (order.isCancelled) {
      return (
        <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" /> Cancelled
        </Badge>
      );
    }
    if (order.isDelivered) {
      return (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <PackageCheck className="h-3 w-3 mr-1" /> Delivered
        </Badge>
      );
    }
    if (order.isShipped) {
      return (
        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
          <Truck className="h-3 w-3 mr-1" /> Shipped
        </Badge>
      );
    }
    if (order.isPaid) {
      return (
        <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Processing
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
        <Clock className="h-3 w-3 mr-1" /> Unfulfilled
      </Badge>
    );
  };

  const getPaymentBadge = (order: Order) => {
    if (order.isCancelled) {
      return (
        <Badge variant="outline" className="text-[10px] bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20">
          Void
        </Badge>
      );
    }
    if (order.isPaid) {
      return (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium">
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* SECTION A: Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time business performance metrics, live order stream, and catalog health
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="hidden xl:inline-block text-xs text-muted-foreground">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing || initialLoading}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </section>

      {/* SECTION B: KPI Cards */}
      <section
        aria-label="Key Performance Indicators"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* KPI 1: Total Revenue */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="space-y-1 py-0.5">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {formatPrice(metrics.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time verified paid sales
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* KPI 2: Total Orders */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="space-y-1 py-0.5">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.totalOrdersCount || metrics.totalPaidOrders}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                  {metrics.pendingOrdersCount} requiring fulfillment
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* KPI 3: Total Customers */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="space-y-1 py-0.5">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered customer accounts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* KPI 4: Active Products */}
        <Card className="glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="space-y-1 py-0.5">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {metrics.activeProducts}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {metrics.totalProducts} total catalog items
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* SECTION C: Analytics (Sales Trend ~65% + Order Status Overview ~35%) */}
      <section
        aria-label="Analytics and Performance"
        className="grid gap-6 lg:grid-cols-12"
      >
        {/* Sales Performance Chart (lg:col-span-8 = ~66%) */}
        <Card className="lg:col-span-8 glass-card border-border/50 flex flex-col justify-between">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Sales Trend</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily completed order revenue across selected period
              </p>
            </div>

            {/* Date-Range Selector Controls */}
            <div
              role="group"
              aria-label="Sales timeline range"
              className="inline-flex items-center p-1 rounded-lg bg-muted/60 border border-border/40 text-xs self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => handleRangeChange(7)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  salesRange === 7
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange(30)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  salesRange === 30
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handleRangeChange(90)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  salesRange === 90
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Last 90 Days
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col justify-end">
            <RevenueChart
              data={salesChartData}
              loading={initialLoading || chartLoading}
            />
          </CardContent>
        </Card>

        {/* Order Status Overview (lg:col-span-4 = ~34%) */}
        <div className="lg:col-span-4">
          <OrderStatusOverview
            orders={recentOrders}
            totalOrdersCount={metrics.totalOrdersCount}
            pendingCount={metrics.pendingOrdersCount}
            loading={initialLoading}
          />
        </div>
      </section>

      {/* SECTION D: Operations (Recent Orders 50% + Inventory Overview 50%) */}
      <section
        aria-label="Store Operations and Inventory"
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Recent Orders */}
        <Card className="glass-card border-border/50 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest customer purchases and current statuses
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[380px] p-0 px-6 pb-4">
            <div className="divide-y divide-border/40">
              {initialLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="space-y-1 text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.slice(0, 7).map((order) => {
                  const customerName =
                    (typeof order.user === "object" && order.user?.name) ||
                    order.shippingAddress?.name ||
                    "Guest Customer";

                  const rawId = order._id || order.id;
                  const displayId = order.orderNumber || (rawId ? `#${rawId.slice(-6).toUpperCase()}` : "ORD");

                  return (
                    <Link
                      key={rawId}
                      href={`/admin/orders/${rawId}`}
                      title={`Order ID: ${rawId} - Click to view details`}
                      className="group flex items-center justify-between py-3 -mx-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {displayId}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px] sm:max-w-[180px]">
                            {customerName}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDateWithTime(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {formatPrice(order.totalPrice)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getPaymentBadge(order)}
                          {getFulfillmentBadge(order)}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">No orders recorded yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customer orders will display here once placed.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Overview */}
        <InventoryOverview
          products={catalogProducts}
          loading={initialLoading}
        />
      </section>

      {/* SECTION E: Product Performance (Top-Selling Products) */}
      <section aria-label="Product Performance">
        <TopSellingProducts
          topProducts={topProducts}
          catalogProducts={catalogProducts}
          loading={initialLoading}
        />
      </section>
    </div>
  );
}
