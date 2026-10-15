"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerProduct } from "@/lib/types/customer";
import { AlertTriangle, CheckCircle, PackageX, Boxes, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface InventoryOverviewProps {
  products: CustomerProduct[];
  loading?: boolean;
}

export function InventoryOverview({ products, loading }: InventoryOverviewProps) {
  if (loading) {
    return (
      <Card className="glass-card border-border/50 flex flex-col h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active products (exclude soft-deleted/draft items)
  const activeProducts = products.filter((p: any) => !p.isRemoved);

  // Calculate stock stats using the existing application threshold of 10
  const outOfStockItems = activeProducts.filter((p) => {
    const qty = p.countInStock !== undefined && p.countInStock !== null ? p.countInStock : (p.stock || 0);
    return qty <= 0;
  });

  const lowStockItems = activeProducts.filter((p) => {
    const qty = p.countInStock !== undefined && p.countInStock !== null ? p.countInStock : (p.stock || 0);
    return qty > 0 && qty <= 10;
  });

  const healthyStockCount = activeProducts.length - outOfStockItems.length - lowStockItems.length;

  // Items requiring attention (out of stock first, then low stock)
  const attentionItems = [...outOfStockItems, ...lowStockItems].slice(0, 5);

  return (
    <Card className="glass-card border-border/50 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Inventory Overview</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stock health and critical replenishment alerts
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
        >
          Manage <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        {/* KPI Mini-Tiles */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <PackageX className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Out</span>
            </div>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {outOfStockItems.length}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Low</span>
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {lowStockItems.length}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
              <Boxes className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Healthy</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {Math.max(0, healthyStockCount)}
            </div>
          </div>
        </div>

        {/* Attention List or Healthy Empty State */}
        <div className="flex-1 space-y-2 pt-1">
          {attentionItems.length > 0 ? (
            attentionItems.map((product) => {
              const qty = product.countInStock !== undefined && product.countInStock !== null
                ? product.countInStock
                : (product.stock || 0);

              const primaryImage =
                product.images?.find((img) => img?.is_primary)?.image_url ||
                product.images?.[0]?.image_url ||
                (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
                product.imageUrl ||
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

              const categoryName = typeof product.category === "object"
                ? product.category?.name
                : (product.category || "General");

              const isOutOfStock = qty <= 0;

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-md overflow-hidden bg-muted shrink-0 border border-border/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate max-w-[170px] sm:max-w-[220px]">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {categoryName} • {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold shrink-0 px-2 py-0.5 border ${
                      isOutOfStock
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {isOutOfStock ? "0 Left (Out)" : `${qty} Left`}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/5">
              <CheckCircle className="h-7 w-7 text-emerald-500 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Inventory Levels Healthy</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                All active products currently have sufficient stock (above the 10-unit replenishment threshold).
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
