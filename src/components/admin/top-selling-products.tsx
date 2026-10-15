"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopSellingProduct } from "@/lib/api";
import type { CustomerProduct } from "@/lib/types/customer";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface TopSellingProductsProps {
  topProducts: TopSellingProduct[];
  catalogProducts: CustomerProduct[];
  loading?: boolean;
}

export function TopSellingProducts({
  topProducts,
  catalogProducts,
  loading,
}: TopSellingProductsProps) {
  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Cross-reference with catalog products for imagery and extra detail
  const productMap = new Map<string, CustomerProduct>();
  catalogProducts.forEach((p) => {
    if (p.id) productMap.set(p.id, p);
    // Also store by normalized string
    if ((p as any)._id) productMap.set(String((p as any)._id), p);
  });

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Top-Selling Products</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Verified Sales
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by units sold from completed, paid customer orders
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0"
        >
          View Catalog <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {topProducts.slice(0, 5).map((item, index) => {
              const matched = productMap.get(item.productId) || productMap.get(String(item.productId));

              const primaryImage =
                matched?.images?.find((img) => img?.is_primary)?.image_url ||
                matched?.images?.[0]?.image_url ||
                (typeof matched?.images?.[0] === "string" ? matched?.images[0] : null) ||
                matched?.imageUrl ||
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

              const categoryName = typeof matched?.category === "object"
                ? matched?.category?.name
                : (matched?.category || "Gadgets");

              const rankBadges = [
                "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
                "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
                "bg-amber-700/15 text-amber-800 dark:text-amber-500 border-amber-700/30",
                "bg-muted text-muted-foreground border-border/50",
                "bg-muted text-muted-foreground border-border/50",
              ];

              return (
                <div
                  key={item.productId || index}
                  className="flex flex-col justify-between p-3.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-border/60 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                        rankBadges[index] || rankBadges[3]
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      {item.totalQtySold} {item.totalQtySold === 1 ? "unit" : "units"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{categoryName}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">Revenue:</span>
                    <span className="font-bold text-foreground">
                      {formatPrice(item.totalRevenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/10 space-y-2">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No completed sales recorded yet</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Top-selling statistics will automatically calculate as paid orders are recorded and completed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
