import Image from "next/image";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { CustomerProduct } from "@/lib/types/customer";

const getPrimaryImage = (product: CustomerProduct) =>
  product.images?.find((image) => image.is_primary)?.image_url ??
  product.images?.[0]?.image_url ??
  product.imageUrl ??
  null;

const getDiscount = (price: number, oldPrice: number | null | undefined) => {
  if (!oldPrice || oldPrice <= price) return null;

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

export function ProductCard({ product }: { product: CustomerProduct }) {
  const imageUrl = getPrimaryImage(product);
  const stock = product.stock ?? product.countInStock;
  const isInStock = stock === undefined || stock === null || stock > 0;
  const discount = getDiscount(product.price, product.old_price);

  return (
    <Card className="group overflow-hidden gap-0 py-0 transition-shadow duration-300 hover:shadow-lg">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-muted"
        aria-label={`View details for ${product.name}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PackageOpen className="size-10" aria-hidden="true" />
            <span className="sr-only">Product image unavailable</span>
          </div>
        )}
        {discount !== null && (
          <Badge className="absolute left-3 top-3 z-10" variant="destructive">
            {discount}% off
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Link href={`/shop/${product.slug}`} className="block">
            <h2 className="line-clamp-2 min-h-12 font-semibold leading-6 transition-colors hover:text-primary">
              {product.name}
            </h2>
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.old_price && product.old_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <span
            className={isInStock ? "text-sm font-medium text-green-600 dark:text-green-400" : "text-sm font-medium text-destructive"}
          >
            {isInStock ? "In stock" : "Out of stock"}
          </span>
          <div className="flex items-center justify-between gap-3">
            <Link href={`/shop/${product.slug}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              View details
            </Link>
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                slug: product.slug,
                image_url: imageUrl ?? "",
              }}
              disabled={!isInStock}
              showIcon={false}
              className="shrink-0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
