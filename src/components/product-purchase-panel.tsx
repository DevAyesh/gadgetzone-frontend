"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerProduct } from "@/lib/types/customer";

export function ProductPurchasePanel({
  product,
  imageUrl,
}: {
  product: CustomerProduct;
  imageUrl: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const stock = product.stock ?? product.countInStock;
  const isInStock = stock === undefined || stock === null || stock > 0;
  const maxQuantity = typeof stock === "number" && stock > 0 ? stock : undefined;

  const setSafeQuantity = (nextQuantity: number) => {
    if (!Number.isFinite(nextQuantity)) return;
    const maximum = maxQuantity ?? Number.MAX_SAFE_INTEGER;
    setQuantity(Math.min(maximum, Math.max(1, Math.floor(nextQuantity))));
  };

  return (
    <div className="space-y-5 border-t border-border/50 pt-6">
      <div className="space-y-2">
        <label htmlFor="product-quantity" className="text-sm font-medium">Quantity</label>
        <div className="flex w-fit items-center rounded-lg border border-border/70">
          <Button type="button" variant="ghost" size="icon" className="rounded-r-none" onClick={() => setSafeQuantity(quantity - 1)} disabled={!isInStock || quantity <= 1} aria-label="Decrease quantity">
            <Minus className="size-4" aria-hidden="true" />
          </Button>
          <Input id="product-quantity" type="number" min={1} max={maxQuantity} value={quantity} onChange={(event) => setSafeQuantity(Number(event.target.value))} disabled={!isInStock} aria-label="Product quantity" className="h-8 w-16 rounded-none border-y-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
          <Button type="button" variant="ghost" size="icon" className="rounded-l-none" onClick={() => setSafeQuantity(quantity + 1)} disabled={!isInStock || (maxQuantity !== undefined && quantity >= maxQuantity)} aria-label="Increase quantity">
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {maxQuantity !== undefined && <p className="text-xs text-muted-foreground">{maxQuantity} available</p>}
      </div>

      <AddToCartButton product={{ id: product.id, name: product.name, price: product.price, slug: product.slug, image_url: imageUrl }} quantity={quantity} disabled={!isInStock} className="w-full py-6 text-base sm:w-auto sm:px-12" />
    </div>
  );
}
