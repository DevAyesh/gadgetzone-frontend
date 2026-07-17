import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Truck, Shield, RotateCcw, Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("name, description").eq("slug", params.slug).single();

  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | GadgetZone`,
    description: product.description || `Buy ${product.name} at GadgetZone`,
  };
}

export default async function ProductDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Try to fetch the product by slug
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name, slug),
      images:product_images(image_url, is_primary)
    `)
    .eq("slug", params.slug)
    .single();

  if (!product) {
    notFound();
  }

  const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
                      || product.images?.[0]?.image_url 
                      || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80";



  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20">
      
      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground mb-8">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li><span>/</span></li>
          <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
          {product.category && (
            <>
              <li><span>/</span></li>
              <li>
                <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary transition-colors">
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li><span>/</span></li>
          <li className="text-foreground font-medium truncate" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Product Image Showcase */}
        <div className="space-y-4">
          <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card glass-card">
            {product.badge && (
              <Badge className="absolute top-4 left-4 z-10 text-sm px-3 py-1" variant={product.badge === 'HOT' ? 'destructive' : 'default'}>
                {product.badge}
              </Badge>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={primaryImage} 
              alt={product.name} 
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500 cursor-zoom-in"
            />
          </div>
          {/* Thumbnails (If we had multiple images, they would go here) */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="relative h-20 w-20 shrink-0 rounded-lg border-2 border-primary overflow-hidden cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={primaryImage} alt={product.name} className="object-cover w-full h-full" />
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          {product.category && (
            <div className="text-primary font-medium tracking-wider uppercase text-sm mb-2">
              {product.category.name}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {formatPrice(product.price)}
            </span>
            {product.old_price && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-8 text-muted-foreground leading-relaxed">
            <p>{product.description || "Experience the pinnacle of modern technology with this premium device. Crafted with precision and designed to elevate your everyday life."}</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-destructive animate-pulse'}`} />
              <span className="font-medium text-sm">
                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="pt-6 border-t border-border/50">
              <AddToCartButton 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  slug: product.slug,
                  image_url: primaryImage
                }}
                className="w-full sm:w-auto px-12 py-6 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Free Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">2 Year Premium Warranty</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">30 Days Return Policy</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">100% Authentic Product</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
