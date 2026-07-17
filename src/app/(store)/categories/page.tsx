import Link from "next/link";
import { ArrowRight, Smartphone, Laptop, Headphones, Camera, Watch, Plug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { name: "Smartphones", slug: "smartphones", icon: Smartphone, desc: "Latest flagship and budget phones" },
  { name: "Laptops", slug: "laptops", icon: Laptop, desc: "High-performance and ultrathin laptops" },
  { name: "Audio", slug: "audio", icon: Headphones, desc: "Premium headphones and speakers" },
  { name: "Cameras", slug: "cameras", icon: Camera, desc: "DSLRs, mirrorless, and action cameras" },
  { name: "Wearables", slug: "wearables", icon: Watch, desc: "Smartwatches and fitness trackers" },
  { name: "Accessories", slug: "accessories", icon: Plug, desc: "Cables, chargers, and cases" },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Browse by Category</h1>
        <p className="text-xl text-muted-foreground">Find exactly what you're looking for from our wide selection of premium electronics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, i) => {
          const Icon = category.icon;
          return (
            <Link key={i} href={`/shop?category=${category.slug}`}>
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 glass-card">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Icon className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <p className="text-muted-foreground">{category.desc}</p>
                  <div className="pt-4 flex items-center text-primary font-medium">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
