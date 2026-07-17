import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-24 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About GadgetZone</h1>
        <p className="text-xl text-muted-foreground">
          Your trusted destination for premium electronics and next-generation technology.
        </p>
      </div>
      
      <div className="space-y-12">
        <section className="glass-card p-8 md:p-12 rounded-3xl border border-border/50">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            At GadgetZone, we believe that technology should be accessible, reliable, and inspiring. 
            Our mission is to curate the finest selection of smart devices and accessories, 
            empowering our customers to stay connected, productive, and entertained in an ever-evolving digital world.
          </p>
        </section>

        <section className="glass-card p-8 md:p-12 rounded-3xl border border-border/50">
          <h2 className="text-2xl font-semibold mb-4 text-secondary">Why Choose Us?</h2>
          <ul className="space-y-4 text-lg text-muted-foreground list-disc pl-6">
            <li><strong>Premium Quality:</strong> We partner only with top-tier brands to ensure excellence.</li>
            <li><strong>Expert Curation:</strong> Every product in our catalog is hand-picked by tech enthusiasts.</li>
            <li><strong>Customer First:</strong> 24/7 support and a hassle-free 30-day return policy.</li>
            <li><strong>Fast Shipping:</strong> Expedited delivery options to get your tech to you instantly.</li>
          </ul>
        </section>
        
        <div className="text-center pt-8">
          <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-14 text-lg shadow-lg")}>
            Explore Our Products <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
