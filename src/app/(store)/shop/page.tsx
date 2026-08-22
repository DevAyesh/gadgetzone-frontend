import { ShopProductListing } from "@/components/shop-product-listing";
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
      </div>
      <ShopProductListing products={products} />
    </div>
  );
}
