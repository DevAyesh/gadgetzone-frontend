import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/api";
import type { CustomerProduct } from "@/lib/types/customer";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const dynamic = "force-dynamic";

export default async function CollectionPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const slug = params.slug;

  let collection: any = null;
  let products: CustomerProduct[] = [];

  try {
    const res = await fetch(`${API_URL}/api/collections/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      collection = data.collection;
      if (Array.isArray(data.products) && data.products.length > 0) {
        products = data.products;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch collection from API:", err);
  }

  // If backend collection search didn't return matching products, query store products dynamically
  if (!products || products.length === 0) {
    try {
      const allProducts = await getProducts({ cache: "no-store" });
      const slugLower = slug.toLowerCase();

      products = allProducts.filter((p) => {
        const catName = (typeof p.category === "object" && p.category?.name ? p.category.name : typeof p.category === "string" ? p.category : "").toLowerCase();
        const catSlug = (typeof p.category === "object" && p.category?.slug ? p.category.slug : "").toLowerCase();
        const collName = (typeof p.collection === "object" && p.collection?.name ? p.collection.name : typeof p.collection === "string" ? p.collection : "").toLowerCase();
        const collSlug = (typeof p.collection === "object" && p.collection?.slug ? p.collection.slug : "").toLowerCase();
        const prodName = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();

        // 1. Direct collection match
        if (collSlug === slugLower || collName === slugLower.replace(/-/g, " ")) {
          return true;
        }

        // 2. Collection specific semantic filters:
        if (slugLower === "apple-products" || slugLower === "apple") {
          return (
            prodName.includes("apple") ||
            prodName.includes("iphone") ||
            prodName.includes("ipad") ||
            prodName.includes("macbook") ||
            prodName.includes("airpods") ||
            prodName.includes("watch") ||
            desc.includes("apple")
          );
        }

        if (slugLower === "headphones" || slugLower === "audio") {
          return (
            catName.includes("audio") ||
            catSlug.includes("audio") ||
            prodName.includes("headphone") ||
            prodName.includes("earphone") ||
            prodName.includes("earbud") ||
            prodName.includes("audio") ||
            prodName.includes("sound") ||
            prodName.includes("speaker")
          );
        }

        if (slugLower === "gaming" || slugLower === "gaming-consoles") {
          return (
            catName.includes("gaming") ||
            catSlug.includes("gaming") ||
            prodName.includes("console") ||
            prodName.includes("playstation") ||
            prodName.includes("xbox") ||
            prodName.includes("nintendo") ||
            prodName.includes("gaming")
          );
        }

        if (slugLower === "accessories") {
          return catName.includes("accessories") || catSlug.includes("accessories");
        }

        if (slugLower === "smartphones" || slugLower === "phones") {
          return catName.includes("phone") || catSlug.includes("phone") || prodName.includes("phone");
        }

        if (slugLower === "laptops") {
          return catName.includes("laptop") || catSlug.includes("laptop") || prodName.includes("laptop") || prodName.includes("macbook");
        }

        // 3. Fallback generic match
        const keyword = slugLower.replace(/-/g, " ");
        return prodName.includes(keyword) || catName.includes(keyword) || desc.includes(keyword);
      });
    } catch (err) {
      console.warn("Failed to query catalog products for collection:", err);
      products = [];
    }
  }

  const pageTitle =
    collection?.name ||
    slug
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="max-w-3xl mb-12 text-center mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground">
          {collection?.description || `Explore our curated selection of ${pageTitle} at GadgetZone.`}
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">
          {products.length} {products.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50 max-w-xl mx-auto p-8">
          <h3 className="text-2xl font-semibold mb-2">No products found in this collection</h3>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find any active products in the {pageTitle} collection right now. Check back soon!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            ← Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: CustomerProduct, i: number) => {
            const primaryImage =
              product.images?.find((img: any) => img.is_primary)?.image_url ||
              product.images?.[0]?.image_url ||
              (typeof product.images?.[0] === "string" ? product.images[0] : null) ||
              product.imageUrl ||
              "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

            const categoryName =
              typeof product.category === "object"
                ? product.category?.name
                : (product.category || "Gadgets");

            const productLink = `/shop/${product.slug || product.id}`;

            return (
              <Card
                key={product.id || i}
                className="group overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
              >
                <Link href={productLink} className="relative aspect-square overflow-hidden bg-muted block">
                  {product.badge && (
                    <Badge
                      className="absolute top-3 left-3 z-10"
                      variant={product.badge === "HOT" ? "destructive" : "default"}
                    >
                      {product.badge}
                    </Badge>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <CardContent className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <Link href={productLink}>
                    <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-4 relative z-20">
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        slug: product.slug,
                        image_url: primaryImage,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
