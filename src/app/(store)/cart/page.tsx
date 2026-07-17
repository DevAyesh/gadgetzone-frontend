import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-24 flex flex-col items-center text-center">
      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Looks like you haven't added anything to your cart yet. Browse our top categories and discover our premium products.
      </p>
      <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
        Continue Shopping
      </Link>
    </div>
  );
}
