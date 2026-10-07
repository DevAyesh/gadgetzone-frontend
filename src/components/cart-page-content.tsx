"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";

export function CartPageContent() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="size-9 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Looks like you haven&apos;t added anything yet. Discover something new in our store.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-full")}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-border/50 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl">Cart items</CardTitle>
            <span className="text-sm text-muted-foreground">{totalItems()} {totalItems() === 1 ? "item" : "items"}</span>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border/50 p-0">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <Link href={`/shop/${item.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted sm:size-28">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.name} className="size-full object-cover" />
                  ) : (
                    <ShoppingCart className="size-7 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="line-clamp-2 font-semibold transition-colors hover:text-primary">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                </div>
              </Link>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center rounded-lg border border-border/60" aria-label={`Quantity for ${item.name}`}>
                  <Button type="button" variant="ghost" size="icon-sm" className="rounded-r-none" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>
                    <Minus className="size-3.5" aria-hidden="true" />
                  </Button>
                  <span className="flex h-7 min-w-8 items-center justify-center border-x border-border/60 px-2 text-sm font-medium">{item.quantity}</span>
                  <Button type="button" variant="ghost" size="icon-sm" className="rounded-l-none" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>
                    <Plus className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
                <span className="w-24 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name} from cart`}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-0 py-0 lg:sticky lg:top-24">
        <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3">
          <CardTitle className="text-xl">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-5 pt-3 sm:p-6 sm:pt-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-5 text-muted-foreground">
            <span>Subtotal ({totalItems()} {totalItems() === 1 ? "item" : "items"})</span>
            <span className="font-semibold text-foreground">{formatPrice(totalPrice())}</span>
          </div>
          <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
          <div className="space-y-3">
            <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full")}>Proceed to Checkout</Link>
            <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-full")}>Continue Shopping</Link>
          </div>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-destructive" onClick={clearCart}>Clear cart</Button>
        </CardContent>
      </Card>
    </div>
  );
}
