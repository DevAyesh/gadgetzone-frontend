import { ShopProductListing } from "@/components/shop-product-listing";
import { getProducts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ShopPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const rawCategory = searchParams?.category;
  const initialCategory =
    typeof rawCategory === "string"
      ? rawCategory
      : Array.isArray(rawCategory)
      ? rawCategory[0] || ""
      : "";

  const rawSearch = searchParams?.search || searchParams?.q || searchParams?.keyword;
  const initialSearch =
    typeof rawSearch === "string"
      ? rawSearch
      : Array.isArray(rawSearch)
      ? rawSearch[0] || ""
      : "";

  const products = await getProducts({ cache: "no-store" });

  return (
    <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Products</h1>
          <p className="mt-2 text-muted-foreground">
            {initialSearch
              ? `Search results for "${initialSearch}"`
              : "Explore the latest tech from GadgetZone."}
          </p>
        </div>
      </div>
      <ShopProductListing
        key={`${initialCategory}-${initialSearch}`}
        products={products}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
      />
    </div>
  );
}
