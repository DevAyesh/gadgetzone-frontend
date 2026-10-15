"use client";

import { useMemo, useState } from "react";
import { ListFilter, PackageSearch, Search, X } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CustomerProduct } from "@/lib/types/customer";

type CategoryOption = {
  label: string;
  value: string;
};

const getProductCategory = (product: CustomerProduct): CategoryOption | null => {
  if (!product.category) return null;

  if (typeof product.category === "string") {
    const name = product.category.trim();
    return { label: name, value: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
  }

  return {
    label: product.category.name,
    value: product.category.slug || product.category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  };
};

const parsePriceToMinorUnits = (value: string) => {
  if (!value.trim()) return null;

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.round(price * 100) : null;
};

export function ShopProductListing({
  products,
  initialCategory = "",
  initialSearch = "",
}: {
  products: CustomerProduct[];
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");

  const [prevInitialSearch, setPrevInitialSearch] = useState(initialSearch);
  if (prevInitialSearch !== initialSearch) {
    setPrevInitialSearch(initialSearch);
    setSearch(initialSearch);
  }

  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  if (prevInitialCategory !== initialCategory) {
    setPrevInitialCategory(initialCategory);
    setCategory(initialCategory);
  }

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, CategoryOption>();

    products.forEach((product) => {
      const productCategory = getProductCategory(product);
      if (productCategory) uniqueCategories.set(productCategory.value, productCategory);
    });

    return [...uniqueCategories.values()].sort((first, second) =>
      first.label.localeCompare(second.label),
    );
  }, [products]);

  const minimumPriceInMinorUnits = parsePriceToMinorUnits(minimumPrice);
  const maximumPriceInMinorUnits = parsePriceToMinorUnits(maximumPrice);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);

    return products.filter((product) => {
      const prodCat = getProductCategory(product);

      // Search matching across name, description, badge, category, and brand
      const matchesSearch = (() => {
        if (!normalizedSearch || searchTokens.length === 0) return true;

        const catLabel = prodCat?.label || "";
        const catValue = prodCat?.value || "";
        const description = product.description || "";
        const badge = product.badge || "";
        const collection = product.collection
          ? typeof product.collection === "string"
            ? product.collection
            : product.collection.name || ""
          : "";
        const brand = (product as unknown as { brand?: string }).brand || "";

        const searchableText = `${product.name} ${description} ${badge} ${brand} ${collection} ${catLabel} ${catValue}`.toLowerCase();

        if (searchableText.includes(normalizedSearch)) return true;

        return searchTokens.every((token) => {
          if (searchableText.includes(token)) return true;
          if (token.endsWith("s") && token.length > 3 && searchableText.includes(token.slice(0, -1))) {
            return true;
          }
          return false;
        });
      })();

      const targetCat = category.toLowerCase();
      const productCatVal = (prodCat?.value || "").toLowerCase();
      const productCatLabel = (prodCat?.label || "").toLowerCase();

      const matchesCategory =
        !category ||
        productCatVal === targetCat ||
        productCatLabel === targetCat ||
        (targetCat === "gaming-consoles" && productCatVal === "gaming") ||
        (targetCat === "gaming" && (productCatVal === "gaming-consoles" || productCatVal === "gaming")) ||
        (targetCat === "headphones" && productCatVal === "audio") ||
        (targetCat === "audio" && (productCatVal === "headphones" || productCatVal === "audio")) ||
        (targetCat === "apple-products" && (product.name.toLowerCase().includes("apple") || (product as any).brand?.toLowerCase() === "apple"));
      const matchesMinimumPrice =
        minimumPriceInMinorUnits === null || product.price >= minimumPriceInMinorUnits;
      const matchesMaximumPrice =
        maximumPriceInMinorUnits === null || product.price <= maximumPriceInMinorUnits;

      return matchesSearch && matchesCategory && matchesMinimumPrice && matchesMaximumPrice;
    });
  }, [category, maximumPriceInMinorUnits, minimumPriceInMinorUnits, normalizedSearch, products]);

  const activeFilterCount = [
    Boolean(normalizedSearch),
    Boolean(category),
    Boolean(minimumPrice.trim()),
    Boolean(maximumPrice.trim()),
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinimumPrice("");
    setMaximumPrice("");
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
        <PackageSearch className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold">No products available</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">Please check back soon for new arrivals.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-8 gap-0 py-0">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 font-medium">
              <ListFilter className="size-4" aria-hidden="true" />
              Search and filter
            </div>
            {hasActiveFilters && <Badge variant="secondary">{activeFilterCount} active</Badge>}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={clearFilters}>
                <X className="size-3.5" aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(10rem,0.8fr)_minmax(8rem,0.55fr)_minmax(8rem,0.55fr)]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                aria-label="Search products by name"
                className="pl-9"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">All categories</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.value} value={categoryOption.value}>
                  {categoryOption.label}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={minimumPrice}
              onChange={(event) => setMinimumPrice(event.target.value)}
              placeholder="Min price (Rs.)"
              aria-label="Minimum price in rupees"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={maximumPrice}
              onChange={(event) => setMaximumPrice(event.target.value)}
              placeholder="Max price (Rs.)"
              aria-label="Maximum price in rupees"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filteredProducts.length} of {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center">
          <PackageSearch className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold">No products match your filters</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">Try adjusting your search, category, or price range.</p>
          <Button variant="outline" className="mt-5" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
