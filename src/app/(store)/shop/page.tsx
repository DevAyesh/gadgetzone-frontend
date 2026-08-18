import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { cn, formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/api";


import type {
  CustomerProduct,
  ProductCategory,
  ProductCollection,
} from "@/lib/types/customer";

const getRelationSlug = (
  relation: ProductCategory | ProductCollection | string | null | undefined,
) => (typeof relation === "string" ? relation : relation?.slug);

const getRelationName = (
  relation: ProductCategory | ProductCollection | string | null | undefined,
) => (typeof relation === "string" ? relation : relation?.name);

const getPrimaryImage = (product: CustomerProduct) =>
  product.images?.find((image) => image.is_primary)?.image_url ??
  product.images?.[0]?.image_url ??
  product.imageUrl ??
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

export default async function ShopPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const collection = typeof searchParams.collection === 'string' ? searchParams.collection : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  
  const products = await getProducts({ next: { revalidate: 60 } });
  const normalizedSearch = search?.trim().toLocaleLowerCase();
  const displayProducts = products.filter((product) => {
    if (category && getRelationSlug(product.category) !== category) return false;
    if (collection && getRelationSlug(product.collection) !== collection) return false;
    if (normalizedSearch && !product.name.toLocaleLowerCase().includes(normalizedSearch)) {
      return false;
    }
    return true;
  });

  let pageTitle = "All Products";
  if (category) {
    pageTitle = category.charAt(0).toUpperCase() + category.slice(1);
  } else if (collection) {
    pageTitle = collection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (search) {
    pageTitle = `Search Results for "${search}"`;
  }
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 space-y-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/shop" className={cn("hover:text-primary transition-colors", !category && "text-primary font-medium")}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=smartphones" className={cn("hover:text-primary transition-colors", category === 'smartphones' && "text-primary font-medium")}>
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/shop?category=laptops" className={cn("hover:text-primary transition-colors", category === 'laptops' && "text-primary font-medium")}>
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=audio" className={cn("hover:text-primary transition-colors", category === 'audio' && "text-primary font-medium")}>
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cameras" className={cn("hover:text-primary transition-colors", category === 'cameras' && "text-primary font-medium")}>
                  Cameras
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wearables" className={cn("hover:text-primary transition-colors", category === 'wearables' && "text-primary font-medium")}>
                  Wearables
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            {pageTitle}
          </h1>
          <span className="text-muted-foreground">{displayProducts.length} Products</span>
        </div>

        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => {
              const primaryImage = getPrimaryImage(product);
              
              return (
                <Card key={product.id} className="group overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                  <Link href={`/shop/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
                    {product.badge && (
                      <Badge className="absolute top-3 left-3 z-10" variant={product.badge === 'HOT' ? 'destructive' : 'default'}>
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
                      {getRelationName(product.category) || 'Uncategorized'}
                    </span>
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
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
                          image_url: primaryImage
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
      
    </div>
  );
}
