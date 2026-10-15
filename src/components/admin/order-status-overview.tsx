"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/lib/types/order";
import { CheckCircle2, Clock, Truck, PackageCheck, XCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface OrderStatusOverviewProps {
  orders: Order[];
  totalOrdersCount: number;
  pendingCount: number;
  loading?: boolean;
}

export function OrderStatusOverview({
  orders,
  totalOrdersCount,
  pendingCount,
  loading,
}: OrderStatusOverviewProps) {
  if (loading) {
    return (
      <Card className="glass-card border-border/50 flex flex-col h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate distribution
  const delivered = orders.filter((o) => o.isDelivered && !o.isCancelled).length;
  const shipped = orders.filter((o) => o.isShipped && !o.isDelivered && !o.isCancelled).length;
  const processing = orders.filter((o) => o.isPaid && !o.isShipped && !o.isDelivered && !o.isCancelled).length;
  const pending = pendingCount || orders.filter((o) => !o.isPaid && !o.isCancelled).length;
  const cancelled = orders.filter((o) => o.isCancelled).length;

  const total = Math.max(orders.length, totalOrdersCount, 1);

  const statuses = [
    {
      label: "Delivered",
      count: delivered,
      percentage: Math.round((delivered / total) * 100),
      icon: PackageCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      pillBg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "In Transit / Shipped",
      count: shipped,
      percentage: Math.round((shipped / total) * 100),
      icon: Truck,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500",
      pillBg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Paid / Ready to Ship",
      count: processing,
      percentage: Math.round((processing / total) * 100),
      icon: CheckCircle2,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
      pillBg: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "Pending Action",
      count: pending,
      percentage: Math.round((pending / total) * 100),
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500",
      pillBg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Cancelled",
      count: cancelled,
      percentage: Math.round((cancelled / total) * 100),
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500",
      pillBg: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  ];

  return (
    <Card className="glass-card border-border/50 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Order Fulfillment</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational pipeline across active orders
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
        >
          Manage <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Multi-segment visual progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
            {statuses.map((s, idx) => (
              s.count > 0 ? (
                <div
                  key={idx}
                  className={`${s.bgColor} transition-all duration-300`}
                  style={{ width: `${Math.max(s.percentage, 2)}%` }}
                  title={`${s.label}: ${s.count}`}
                />
              ) : null
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
            <span>{totalOrdersCount || orders.length} tracked orders</span>
            <span>{pending} needing fulfillment</span>
          </div>
        </div>

        {/* Status Breakdown List */}
        <div className="space-y-2 pt-1">
          {statuses.map((status, index) => {
            const Icon = status.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-md ${status.pillBg} ${status.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-foreground">{status.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{status.count}</span>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">
                    {status.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
