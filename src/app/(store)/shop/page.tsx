import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/api";

export default async function ShopPage() {
  const products = await getProducts({ cache: "no-store" });

  return (
    <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Products</h1>
          <p className="mt-2 text-muted-foreground">Explore the latest tech from GadgetZone.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
          <PackageSearch className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold">No products available</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">Please check back soon for new arrivals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
