"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image_url: string;
  };
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  showIcon?: boolean;
}

export function AddToCartButton({ product, className, variant = "default", showIcon = true }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link area
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image_url: product.image_url,
    });
    
    toast.success("Added to cart", {
      description: `${product.name} was added to your shopping cart.`,
      action: {
        label: "View Cart",
        onClick: () => {
          // You could trigger a global event here to open the sheet if you wanted
          document.dispatchEvent(new CustomEvent('open-cart'));
        }
      }
    });
  };

  return (
    <Button 
      variant={variant} 
      className={cn("w-full transition-all duration-300 active:scale-95", className)} 
      onClick={handleAddToCart}
    >
      {showIcon && <ShoppingCart className="w-4 h-4 mr-2" />}
      Add to Cart
    </Button>
  );
}
