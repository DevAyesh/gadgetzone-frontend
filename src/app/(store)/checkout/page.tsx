"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { processCheckout } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Banknote, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    paymentMethod: "payhere" // default
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add some products to your cart to checkout.</p>
        <Button onClick={() => router.push("/shop")}>Return to Shop</Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (method: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await processCheckout(formData, items, totalPrice());
      
      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/checkout/success?order=${result.orderNumber}`);
      } else {
        toast.error(result.error || "Something went wrong.");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column - Forms */}
        <div className="lg:col-span-7 space-y-10">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Shipping Info */}
            <section className="glass-card p-6 md:p-8 rounded-2xl border border-border/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input required id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input required id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className="bg-background/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input required type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressLine1">Address</Label>
                  <Input required id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="123 Main St" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input required id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Colombo" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input required id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="077 123 4567" className="bg-background/50" />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="glass-card p-6 md:p-8 rounded-2xl border border-border/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Payment Method
              </h2>

              <div className="space-y-4">
                <div 
                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'payhere' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                  onClick={() => handlePaymentSelect('payhere')}
                >
                  <CreditCard className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'payhere' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-medium">PayHere (Credit/Debit Card)</h3>
                    <p className="text-sm text-muted-foreground">Secure payment via Visa, Mastercard, AMEX</p>
                  </div>
                  {formData.paymentMethod === 'payhere' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>

                <div 
                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'koko' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                  onClick={() => handlePaymentSelect('koko')}
                >
                  <div className={`h-6 w-6 mr-4 flex items-center justify-center font-bold text-xs rounded ${formData.paymentMethod === 'koko' ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground'}`}>K</div>
                  <div className="flex-1">
                    <h3 className="font-medium">Koko (Buy Now Pay Later)</h3>
                    <p className="text-sm text-muted-foreground">Pay in 3 interest-free installments</p>
                  </div>
                  {formData.paymentMethod === 'koko' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>

                <div 
                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                  onClick={() => handlePaymentSelect('bank_transfer')}
                >
                  <Building className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'bank_transfer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-medium">Bank Transfer</h3>
                    <p className="text-sm text-muted-foreground">Direct transfer to our account</p>
                  </div>
                  {formData.paymentMethod === 'bank_transfer' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>

                <div 
                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                  onClick={() => handlePaymentSelect('cod')}
                >
                  <Banknote className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground">Pay with cash upon delivery</p>
                  </div>
                  {formData.paymentMethod === 'cod' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 glass-card p-6 md:p-8 rounded-2xl border border-border/50">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-border/50">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-4">
                <span>Total</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              className="w-full mt-8 h-12 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Complete Order - {formatPrice(totalPrice())}</>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
