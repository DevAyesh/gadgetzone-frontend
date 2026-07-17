import Link from "next/link";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50" />
        
        <div className="container mx-auto px-4 md:px-8 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm rounded-full glass">
            ✨ Next Generation Electronics
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl">
            Upgrade Your Life With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Premium Gadgets
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Discover the latest smartphones, laptops, and smart accessories. 
            Experience unparalleled quality and innovation at GadgetZone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:scale-105 transition-transform")}>
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 px-8 text-lg rounded-full glass hover:bg-white/20 transition-colors")}>
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6 glass-card rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Fast Delivery</h3>
              <p className="text-muted-foreground">Get your gadgets delivered to your doorstep within 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 glass-card rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-muted-foreground">100% secure payment processing with industry-leading encryption.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 glass-card rounded-2xl">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Latest Tech</h3>
              <p className="text-muted-foreground">We stock only the newest and most innovative tech products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products (Mock) */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Trending Now</h2>
              <p className="text-muted-foreground">Our most popular premium products this week.</p>
            </div>
            <Link href="/shop" className={cn(buttonVariants({ variant: "ghost" }), "hidden md:flex")}>
              View all products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "1", name: "iPhone 15 Pro Max", price: 119900, priceStr: "$1,199", img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80", badge: "HOT", slug: "iphone-15-pro-max" },
              { id: "2", name: "Sony WH-1000XM5", price: 34800, priceStr: "$348", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", badge: "SALE", slug: "sony-wh-1000xm5" },
              { id: "3", name: "MacBook Air M3", price: 109900, priceStr: "$1,099", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80", badge: "NEW", slug: "macbook-air-m3" },
              { id: "4", name: "Apple Watch Ultra", price: 79900, priceStr: "$799", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80", badge: "", slug: "apple-watch-ultra" }
            ].map((product, i) => (
              <Card key={i} className="group overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 z-10" variant={product.badge === 'HOT' ? 'destructive' : 'default'}>
                      {product.badge}
                    </Badge>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.img} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="mt-auto pt-4 relative z-20">
                      <AddToCartButton 
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          slug: product.slug,
                          image_url: product.img
                        }}
                      />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  <p className="text-muted-foreground mt-1">{product.priceStr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "w-full mt-8 md:hidden")}>
            View all products
          </Link>
        </div>
      </section>

    </div>
  );
}
