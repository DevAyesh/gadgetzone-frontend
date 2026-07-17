"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Hydration fix for zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    // Listen for custom event from AddToCartButton
    const handleOpenCart = () => setIsOpen(true);
    document.addEventListener('open-cart', handleOpenCart);
    return () => document.removeEventListener('open-cart', handleOpenCart);
  }, []);

  if (!mounted) return (
    <Button variant="ghost" size="icon" className="rounded-full relative">
      <ShoppingCart className="h-5 w-5" />
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-full relative" />}>
        <ShoppingCart className="h-5 w-5" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
            {totalItems()}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full border-l border-border/50 glass">
        <SheetHeader className="pb-6 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({totalItems()})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
              </div>
              <Button onClick={() => setIsOpen(false)} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="h-20 w-20 rounded-md object-cover border border-border/50"
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/shop/${item.slug}`} onClick={() => setIsOpen(false)} className="font-semibold hover:text-primary transition-colors line-clamp-2 text-sm">
                        {item.name}
                      </Link>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm font-medium mt-1">
                      {formatPrice(item.price)}
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-2">
                      <div className="flex items-center border border-border/50 rounded-md">
                        <button className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-8 flex items-center justify-center text-xs font-medium border-x border-border/50">
                          {item.quantity}
                        </span>
                        <button className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-6 border-t border-border/50 space-y-4">
            <div className="flex justify-between font-medium text-lg">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                Continue Shopping
              </Button>
              <Link href="/checkout" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "w-full" })}>
                Checkout
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
