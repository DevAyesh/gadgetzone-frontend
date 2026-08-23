import { CartPageContent } from "@/components/cart-page-content";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Shopping Cart</h1>
        <p className="mt-2 text-muted-foreground">Review your items before checkout.</p>
      </div>
      <CartPageContent />
    </div>
  );
}
