import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";

import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { Badge } from "@/components/ui/badge";
import { ApiError, getProductBySlug } from "@/lib/api";
import type { CustomerProduct } from "@/lib/types/customer";
import { formatPrice } from "@/lib/utils";

const getCategory = (product: CustomerProduct) => {
  if (!product.category) return null;
  return typeof product.category === "string"
    ? { name: product.category, slug: product.category }
    : product.category;
};

const getPrimaryImage = (product: CustomerProduct) =>
  product.images?.find((image) => image.is_primary)?.image_url ??
  product.images?.[0]?.image_url ??
  product.imageUrl ??
  null;

const getDiscount = (price: number, oldPrice: number | null | undefined) => {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const product = await getProductBySlug(slug, { next: { revalidate: 60 } });
    return {
      title: `${product.name} | GadgetZone`,
      description: product.description || `Buy ${product.name} at GadgetZone`,
    };
  } catch {
    return { title: "Product | GadgetZone" };
  }
}

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  let product: CustomerProduct;

  try {
    product = await getProductBySlug(slug, { next: { revalidate: 60 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const category = getCategory(product);
  const primaryImage = getPrimaryImage(product);
  const discount = getDiscount(product.price, product.old_price);
  const stock = product.stock ?? product.countInStock;
  const isInStock = stock === undefined || stock === null || stock > 0;

  return (
    <div className="container mx-auto px-4 py-10 md:px-8 lg:py-16">
      <nav className="mb-8 overflow-hidden text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 whitespace-nowrap">
          <li><Link href="/" className="hover:text-primary">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/shop" className="hover:text-primary">Shop</Link></li>
          {category && <><li aria-hidden="true">/</li><li><Link href={`/shop?category=${category.slug}`} className="hover:text-primary">{category.name}</Link></li></>}
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-foreground" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card">
            {primaryImage ? (
              <Image src={primaryImage} alt={product.name} fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover transition-transform duration-500 hover:scale-105" />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <PackageOpen className="size-14" aria-hidden="true" />
                <span className="sr-only">Product image unavailable</span>
              </div>
            )}
            {discount !== null && <Badge className="absolute left-4 top-4 z-10 px-3 py-1" variant="destructive">{discount}% off</Badge>}
          </div>
        </div>

        <div className="flex flex-col">
          {category && <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">{category.name}</p>}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-3xl font-bold sm:text-4xl">{formatPrice(product.price)}</span>
            {product.old_price && product.old_price > product.price && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.old_price)}</span>}
          </div>

          <div className="mt-7 border-t border-border/50 pt-6 text-muted-foreground">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground">Description</h2>
            <p className="leading-relaxed">{product.description || "No description is available for this product yet."}</p>
          </div>

          <div className="mt-7 flex items-center gap-2">
            <span className={`size-3 rounded-full ${isInStock ? "bg-green-500" : "bg-destructive"}`} aria-hidden="true" />
            <span className={`text-sm font-medium ${isInStock ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {isInStock ? (stock === undefined || stock === null ? "In stock" : `${stock} available`) : "Out of stock"}
            </span>
          </div>

          <div className="mt-6"><ProductPurchasePanel product={product} imageUrl={primaryImage ?? ""} /></div>

          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-border/50 pt-6 sm:grid-cols-2">
            <p className="text-sm text-muted-foreground">Free Worldwide Shipping</p>
            <p className="text-sm text-muted-foreground">2 Year Premium Warranty</p>
            <p className="text-sm text-muted-foreground">30 Days Return Policy</p>
            <p className="text-sm text-muted-foreground">100% Authentic Product</p>
          </div>
        </div>
      </div>
    </div>
  );
}
