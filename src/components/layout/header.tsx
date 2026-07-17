import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart-sheet";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                <Link href="/shop" className="text-lg font-medium hover:text-primary transition-colors">Shop</Link>
                <Link href="/categories" className="text-lg font-medium hover:text-primary transition-colors">Categories</Link>
                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">About Us</Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              GadgetZone
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-full">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <CartSheet />

          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Link>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
