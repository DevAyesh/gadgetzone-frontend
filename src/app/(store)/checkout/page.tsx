"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { processCheckout } from "./actions";
import { markOrderPaymentFailed, confirmPayment } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Banknote, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Script from "next/script";

declare global {
  interface Window {
    payhere?: {
      startPayment?: (payment: any) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: any) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
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
    state: "",
    postalCode: "",
    paymentMethod: "payhere" // default
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event.reason?.stack || event.reason?.message || event.reason || "");
      if (reasonStr.includes("chrome-extension://") || reasonStr.includes("M_ID")) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").trim().split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || parts[0] || "",
        lastName: prev.lastName || parts.slice(1).join(" ") || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phoneNumber || "",
        addressLine1: prev.addressLine1 || user.address_line1 || "",
      }));
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone Number is required.";
    } else if (!/^[\d\s+\-()]{6,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.state.trim()) newErrors.state = "State/Province is required.";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal Code is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await processCheckout(formData, items, totalPrice(), token);

      if (!result.success) {
        toast.error(result.error || "Order creation failed.");
        setIsSubmitting(false);
        return;
      }

      // If user chose PayHere and PayHere hash returned
      if (formData.paymentMethod === "payhere" && result.payhereParams && typeof window !== "undefined") {
        if (typeof window.payhere !== "undefined" && window.payhere && typeof window.payhere.startPayment === "function") {
          try {
            const payhereConfig = {
              sandbox: true,
              merchant_id: result.payhereParams.merchant_id || "",
              return_url: `${window.location.origin}/checkout/success?order=${result.orderNumber}`,
              cancel_url: `${window.location.origin}/checkout`,
              notify_url: `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api/payments/notify`,

              order_id: result.payhereParams.order_id,
              items: items.map(i => i.name).join(", "),
              amount: result.payhereParams.amount,
              currency: result.payhereParams.currency || "LKR",
              hash: result.payhereParams.hash,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              address: formData.addressLine1,
              city: formData.city,
              country: "Sri Lanka",
            };

            if (window.payhere) {
              window.payhere.onCompleted = async function onCompleted(orderId: string) {
                try {
                  const targetOrderId = result.orderId || orderId;
                  if (targetOrderId) {
                    await confirmPayment(targetOrderId);
                  }
                } catch (confirmErr) {
                  console.warn("Could not confirm payment on server:", confirmErr);
                }
                toast.success("Payment completed successfully!");
                clearCart();
                router.push(`/checkout/success?order=${result.orderNumber}`);
              };


              window.payhere.onDismissed = async function onDismissed() {
                toast.error("Payment was not completed. You can try to pay again from your orders.");
                try {
                  if (result.orderId) {
                    await markOrderPaymentFailed(result.orderId, "Customer dismissed PayHere payment window");
                  }
                } catch (e) {
                  console.warn("Could not mark payment as failed:", e);
                }
                clearCart();
                router.push(`/account?tab=orders&retry=${result.orderId}`);
              };

              window.payhere.onError = async function onError(error: any) {
                toast.error(`Payment processing error: ${error || 'Payment failed'}. You can try to pay again from your orders.`);
                try {
                  if (result.orderId) {
                    await markOrderPaymentFailed(result.orderId, String(error || "Payment gateway processing error"));
                  }
                } catch (e) {
                  console.warn("Could not mark payment as failed:", e);
                }
                clearCart();
                router.push(`/account?tab=orders&retry=${result.orderId}`);
              };

              window.payhere.startPayment?.(payhereConfig);
              return;
            }
          } catch (payhereErr) {
            console.warn("PayHere gateway execution error:", payhereErr);
          }
        }
      }

      // Fallback or non-PayHere methods (COD, Bank Transfer, Koko)
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/checkout/success?order=${result.orderNumber}`);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script src="https://www.payhere.lk/lib/payhere.js" strategy="lazyOnload" />
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
                    <Input required id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className={`bg-background/50 ${errors.firstName ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input required id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className={`bg-background/50 ${errors.lastName ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address (Order confirmation will be sent here)</Label>
                    <Input required type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className={`bg-background/50 ${errors.email ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine1">Delivery Address</Label>
                    <Input required id="addressLine1" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="123 Main St" className={`bg-background/50 ${errors.addressLine1 ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.addressLine1 && <p className="text-xs text-destructive">{errors.addressLine1}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input required id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Colombo" className={`bg-background/50 ${errors.city ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Province / State</Label>
                    <Input required id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="Western Province" className={`bg-background/50 ${errors.state ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input required id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="00100" className={`bg-background/50 ${errors.postalCode ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input required id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="077 123 4567" className={`bg-background/50 ${errors.phone ? 'border-destructive ring-1 ring-destructive' : ''}`} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="glass-card p-6 md:p-8 rounded-2xl border border-border/50">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                  Payment Method
                </h2>

                <div className="space-y-4" role="radiogroup" aria-label="Payment Methods">
                  <div
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'payhere' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                    role="radio"
                    aria-checked={formData.paymentMethod === 'payhere'}
                    tabIndex={0}
                    onClick={() => handlePaymentSelect('payhere')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePaymentSelect('payhere'); } }}
                  >
                    <CreditCard className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'payhere' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h3 className="font-medium">PayHere (Credit/Debit Card)</h3>
                      <p className="text-sm text-muted-foreground">Secure payment via Visa, Mastercard, AMEX with instant receipt</p>
                    </div>
                    {formData.paymentMethod === 'payhere' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>

                  <div
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'koko' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                    role="radio"
                    aria-checked={formData.paymentMethod === 'koko'}
                    tabIndex={0}
                    onClick={() => handlePaymentSelect('koko')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePaymentSelect('koko'); } }}
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
                    role="radio"
                    aria-checked={formData.paymentMethod === 'bank_transfer'}
                    tabIndex={0}
                    onClick={() => handlePaymentSelect('bank_transfer')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePaymentSelect('bank_transfer'); } }}
                  >
                    <Building className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'bank_transfer' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h3 className="font-medium">Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">Direct bank transfer to GadgetZone corporate account</p>
                    </div>
                    {formData.paymentMethod === 'bank_transfer' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>

                  <div
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 hover:bg-muted/50'}`}
                    role="radio"
                    aria-checked={formData.paymentMethod === 'cod'}
                    tabIndex={0}
                    onClick={() => handlePaymentSelect('cod')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePaymentSelect('cod'); } }}
                  >
                    <Banknote className={`h-6 w-6 mr-4 ${formData.paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <h3 className="font-medium">Cash on Delivery (COD)</h3>
                      <p className="text-sm text-muted-foreground">Pay with cash upon package delivery at your doorstep</p>
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
                  <span className="text-green-500 font-medium">Free Islandwide</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice())}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full mt-8 h-12 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Checkout...
                  </>
                ) : (
                  <>Complete Order — {formatPrice(totalPrice())}</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By placing your order, you agree to GadgetZone's Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
