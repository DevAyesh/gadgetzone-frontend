"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const INQUIRY_CATEGORIES = [
  { value: "order", label: "📦 Order Tracking & Delivery" },
  { value: "product", label: "💻 Product Inquiry & Compatibility" },
  { value: "warranty", label: "🛡️ Warranty & Technical Support" },
  { value: "returns", label: "🔄 Returns & Refund Request" },
  { value: "corporate", label: "🏢 Corporate & Bulk Orders" },
  { value: "other", label: "💬 General Inquiry" },
];

const FAQS = [
  {
    q: "How fast is shipping across Sri Lanka?",
    a: "Orders within Colombo and suburbs are typically delivered within 24 hours. Islandwide deliveries take 1 to 3 business days via our premium courier partners.",
  },
  {
    q: "Are all products original with official warranty?",
    a: "Yes, 100% of the products sold on GadgetZone are genuine and sourced through authorized distributors, complete with a minimum 1-Year manufacturer or store warranty.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept PayHere (Visa, MasterCard, Amex), Cash on Delivery (COD), Direct Bank Transfer, and Buy Now Pay Later (Koko / Mintpay).",
  },
  {
    q: "Can I collect my order in person?",
    a: "Yes! You can choose In-Store Pickup at checkout or visit our Colombo 03 Experience Store to collect and inspect your order immediately.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "order",
    orderNumber: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields (Name, Email, and Message).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission delay
      await new Promise((resolve) => setTimeout(resolve, 900));

      setSubmitted(true);
      toast.success("Thank you! Your message has been received.", {
        description: "Our customer support team will reply within 2 to 4 hours.",
      });
    } catch {
      toast.error("Failed to submit message. Please try again or reach out directly by phone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "order",
      orderNumber: "",
      subject: "",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl relative z-10">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border-primary/20 gap-1.5 inline-flex"
          >
            <Sparkles className="h-3.5 w-3.5" /> 24/7 Dedicated Support
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            We&apos;re Here to <span className="text-primary">Help You</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have questions about a gadget, need order assistance, or looking for technical advice?
            Reach out to our team of tech specialists anytime.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 md:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Contact Channels & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Get in Touch</h2>
              <p className="text-sm text-muted-foreground">
                Choose the communication channel that works best for you.
              </p>
            </div>

            {/* Support Cards */}
            <div className="space-y-4">
              {/* Phone Card */}
              <div className="glass-card p-5 md:p-6 rounded-2xl border border-border/50 hover:border-primary/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">Phone & WhatsApp</h3>
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20">
                        Live
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mon – Sat: 9:00 AM – 7:00 PM (IST)
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <a
                        href="tel:+94771234567"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        +94 77 123 4567
                      </a>
                      <span className="hidden sm:inline text-muted-foreground">•</span>
                      <a
                        href="tel:+94112345678"
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        +94 11 234 5678
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="glass-card p-5 md:p-6 rounded-2xl border border-border/50 hover:border-primary/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">Email Support</h3>
                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                        ~2h Reply
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Orders, warranty claims & technical inquiries
                    </p>
                    <div className="pt-2">
                      <a
                        href="mailto:gadgetzone.support.service@gmail.com"
                        className="text-sm font-semibold text-primary hover:underline break-all"
                      >
                        gadgetzone.support.service@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Location Card */}
              <div className="glass-card p-5 md:p-6 rounded-2xl border border-border/50 hover:border-primary/40 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">Experience Store & HQ</h3>
                    <p className="text-xs text-muted-foreground">
                      Visit for hands-on demos, instant pick-ups & warranty drop-offs
                    </p>
                    <p className="text-sm font-medium pt-2 text-foreground/90">
                      No. 45, Galle Road, Colombo 03, Western Province, Sri Lanka
                    </p>
                    <div className="pt-2">
                      <a
                        href="https://maps.google.com/?q=Colombo+03+Sri+Lanka"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                      >
                        Get Directions on Google Maps <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours Card */}
              <div className="glass-card p-5 md:p-6 rounded-2xl border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 w-full text-xs">
                    <h3 className="font-semibold text-base text-foreground">Operating Hours</h3>
                    <div className="pt-2 space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday – Saturday:</span>
                        <span className="font-medium text-foreground">9:00 AM – 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday & Public Holidays:</span>
                        <span className="font-medium text-foreground">10:00 AM – 4:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-border/40 bg-muted/20 text-center space-y-1">
                <ShieldCheck className="h-5 w-5 mx-auto text-primary" />
                <p className="text-[11px] font-semibold">1-Yr Warranty</p>
                <p className="text-[10px] text-muted-foreground">100% Genuine</p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 bg-muted/20 text-center space-y-1">
                <Truck className="h-5 w-5 mx-auto text-primary" />
                <p className="text-[11px] font-semibold">Express Delivery</p>
                <p className="text-[10px] text-muted-foreground">1-3 Days Islandwide</p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 bg-muted/20 text-center space-y-1">
                <RotateCcw className="h-5 w-5 mx-auto text-primary" />
                <p className="text-[11px] font-semibold">7-Day Return</p>
                <p className="text-[10px] text-muted-foreground">Easy Replacement</p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 md:p-10 rounded-3xl border border-border/60 shadow-xl relative overflow-hidden">
              {submitted ? (
                /* Success State */
                <div className="py-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-500/5 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-2xl font-bold tracking-tight">Message Received!</h2>
                    <p className="text-sm text-muted-foreground">
                      Thank you for contacting GadgetZone, <strong className="text-foreground">{formData.name}</strong>.
                      We have routed your ticket to our technical specialists. We will follow up at{" "}
                      <span className="font-medium text-foreground">{formData.email}</span> within 2–4 hours.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button onClick={handleReset} variant="outline" className="rounded-xl">
                      Send Another Message
                    </Button>
                    <Link href="/shop" className={cn(buttonVariants(), "rounded-xl")}>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" /> Send Us a Message
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form below and our customer support team will get back to you promptly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Kasun Perera"
                        className="bg-background/50 h-11"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. kasun@example.com"
                        className="bg-background/50 h-11"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 077 123 4567"
                        className="bg-background/50 h-11"
                      />
                    </div>

                    {/* Order Number */}
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Order Number (If applicable)</Label>
                      <Input
                        id="orderNumber"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleChange}
                        placeholder="e.g. ORD-123456"
                        className="bg-background/50 h-11"
                      />
                    </div>
                  </div>

                  {/* Inquiry Topic / Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Inquiry Topic</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full h-11 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {INQUIRY_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-background">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Question regarding MacBook Pro warranty"
                      className="bg-background/50 h-11"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Your Message <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      required
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Provide detailed information regarding your inquiry so we can assist you quickly..."
                      className="w-full min-h-[130px] rounded-lg border border-input bg-background/50 p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    By submitting this form, you agree to our{" "}
                    <Link href="/privacy" className="underline hover:text-foreground">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="underline hover:text-foreground">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps / Location Section */}
      <section className="container mx-auto px-4 md:px-8 py-8">
        <div className="glass-card rounded-3xl border border-border/50 overflow-hidden p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Visit Our Flagship Store
              </h2>
              <p className="text-sm text-muted-foreground">
                Centrally located on Galle Road in Colombo 03 with dedicated customer parking.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Galle+Road+Colombo+03+Sri+Lanka"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-xl shrink-0 gap-1.5")}
            >
              Open in Maps <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="w-full h-[320px] md:h-[400px] rounded-2xl overflow-hidden border border-border/40 relative bg-muted/40">
            <iframe
              title="GadgetZone Store Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15843.424683058728!2d79.84838634999999!3d6.90776785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259639e334cf3%3A0x6b301b44ec0a0cfb!2sKollupitiya%2C%20Colombo%2003!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="filter contrast-[0.95] opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-4xl">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Quick Answers
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Looking for quick answers? Check out our most common inquiries below.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-border/50 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-semibold text-base flex items-center justify-between gap-4 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground mb-3">
            Didn&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/faq"
            className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
          >
            Visit Full FAQ Page
          </Link>
        </div>
      </section>
    </div>
  );
}
