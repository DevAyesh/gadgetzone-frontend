import Link from "next/link";
import { ArrowRight, Truck, RefreshCcw, CreditCard, Headset, Zap } from "lucide-react";
import { SiSamsung, SiGoogle, SiSony, SiApple, SiBose, SiJbl, SiXiaomi, SiFitbit } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { buttonVariants } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HeroSlider } from "@/components/hero-slider";
import { formatPrice } from "@/lib/utils";
import { getProducts } from "@/lib/api";
import type { CustomerProduct } from "@/lib/types/customer";

function HomeProductCard({ product }: { product: CustomerProduct }) {
  const imageUrl = product.images?.find((img) => img.is_primary)?.image_url ?? product.images?.[0]?.image_url ?? product.imageUrl ?? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";
  const categoryName = product.category ? (typeof product.category === "string" ? product.category : product.category.name) : "Gadgets";

  return (
    <Card className="group bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden max-w-[260px] mx-auto w-full flex flex-col h-full gap-0 py-0">
      <Link href={`/shop/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50/50 flex items-center justify-center p-0 block cursor-pointer">
        {product.badge && (
          <Badge className="absolute top-3 left-3 z-10 bg-black text-white hover:bg-black rounded-sm text-xs font-semibold px-2 py-0.5">
            {product.badge}
          </Badge>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
      </Link>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-[10px] text-gray-500 border border-gray-200 rounded-full px-2 py-0.5 bg-gray-50/50">
            {categoryName}
          </span>
        </div>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-3 mt-1 flex-grow leading-relaxed hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="font-bold text-base text-gray-900">
            {formatPrice(product.price)}
          </p>

          <AddToCartButton
            className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 text-gray-500 hover:text-black border-0 shadow-none transition-colors"
            variant="ghost"
            showIcon={true}
            iconOnly={true}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              slug: product.slug,
              image_url: imageUrl
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  let products: CustomerProduct[] = [];
  try {
    products = await getProducts({ next: { revalidate: 60 } });
  } catch (error) {
    console.error("Failed to fetch products for Home page:", error);
  }

  // Extract categories dynamically from the real products array
  const dbCategories = Array.from(new Set(
    products
      .map(p => p.category ? (typeof p.category === 'string' ? p.category : p.category.name) : null)
      .filter(Boolean)
  )).map(cat => ({
    id: cat,
    name: cat as string,
    slug: (cat as string).toLowerCase().replace(/\s+/g, '-')
  })).sort((a, b) => a.name.localeCompare(b.name));

  const categoryImages: Record<string, string> = {
    'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
    'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80',
    'audio': 'https://dlifestylesg.com/cdn/shop/files/ULT_WEAR_Black_Standard-Large_1200x.jpg?v=1712806803',
    'wearables': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&q=80',
    'cameras': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80',
    'gaming': 'https://pisces.bbystatic.com/image2/BestBuy_US/dam/4672150-VG-cope-0389c629-d4c2-4afd-9ec0-46adadd4b8cf.jpg;maxHeight=455;maxWidth=815',
    'gaming-consoles': 'https://pisces.bbystatic.com/image2/BestBuy_US/dam/4672150-VG-cope-0389c629-d4c2-4afd-9ec0-46adadd4b8cf.jpg;maxHeight=455;maxWidth=815',
    'accessories': 'https://cdn.packhacker.com/2022/07/f1b89bdb-travel-tech-acc-featured.jpg'
  };

  // Derive new arrivals from products marked with badge "NEW" or simply take the latest ones if no badges exist
  let displayNewArrivals = products.filter(p => p.badge?.toUpperCase() === "NEW" || p.badge?.toUpperCase() === "SALE");
  if (displayNewArrivals.length === 0) {
    displayNewArrivals = products.slice(0, 5); // Fallback to first 5 items
  }
  displayNewArrivals = displayNewArrivals.slice(0, 5);

  // Derive popular products by skipping the new arrivals and grabbing up to 10 limits
  const newArrivalIds = new Set(displayNewArrivals.map(p => p.id));
  let displayPopularProducts = products.filter(p => !newArrivalIds.has(p.id));
  displayPopularProducts = displayPopularProducts.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Free Delivery</h3>
                <p className="text-xs text-gray-500 mt-1">Orders above $200</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Refund Policy</h3>
                <p className="text-xs text-gray-500 mt-1">30 days guarantee</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Online Payments</h3>
                <p className="text-xs text-gray-500 mt-1">Secure payment 100%</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-[#F8F9FA] rounded-md text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-black border border-gray-100 shadow-sm">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">24/7 Support</h3>
                <p className="text-xs text-gray-500 mt-1">Dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              Shop <span className="font-extrabold text-[#1A1A2E]">by Categories</span>
            </h2>
            <Link href="/shop" className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
              View All
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-8 pb-8 pt-4 scrollbar-hide snap-x">
            {dbCategories?.map((cat) => {
              const imgUrl = categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=300&q=80';
              return (
                <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="flex flex-col items-center gap-4 group shrink-0 snap-start">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#EBE5F7] flex items-center justify-center p-2 mx-auto group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-2">
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-sm md:text-base font-semibold text-center text-gray-800 group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">New Arrivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {displayNewArrivals.length > 0 ? (
              displayNewArrivals.map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No new arrivals available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Shop Collection Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-8">Shop Collection</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-auto lg:h-[600px]">
            {/* Left Large Box - Centered Text */}
            <div className="rounded-2xl relative overflow-hidden flex flex-col justify-center items-center text-center h-[400px] lg:h-full group cursor-pointer shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://pisces.bbystatic.com/image2/BestBuy_US/dam/bento-4844950-FY26-AppleBrandStore-AppleDeals_sv-b038cf90-9b51-4a56-b959-2a7f7c42f29a.jpg;format=webp"
                alt="Apple Products"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors pointer-events-none" />
              <div className="relative z-10 p-8 text-white flex flex-col items-center">
                <h3 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">Apple Products</h3>
                <Link href="/collections/apple-products" className="text-sm font-semibold hover:underline inline-flex items-center gap-1 group/link text-white/90">
                  Explore <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Stacked Boxes */}
            <div className="grid grid-rows-2 gap-4 md:gap-6 h-[800px] lg:h-full">
              {/* Top Wide Box - Top Left Text (Now Gaming Consoles) */}
              <div className="rounded-2xl relative overflow-hidden flex flex-col justify-start items-start h-full group cursor-pointer shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pisces.bbystatic.com/image2/BestBuy_US/dam/4672150-VG-cope-0389c629-d4c2-4afd-9ec0-46adadd4b8cf.jpg;maxHeight=455;maxWidth=815"
                  alt="Gaming Consoles"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity group-hover:opacity-90" />
                <div className="relative z-10 p-8 text-white text-left">
                  <h3 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight">Gaming Consoles</h3>
                  <Link href="/shop?category=gaming-consoles" className="text-sm font-semibold hover:underline inline-flex items-center gap-1 group/link text-white/90">
                    Explore <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Bottom Split Boxes */}
              <div className="grid grid-cols-2 gap-4 md:gap-6 h-full">
                {/* Bottom Left - Centered Text (Accessories) */}
                <div className="rounded-2xl relative overflow-hidden flex flex-col justify-center items-center text-center h-full group cursor-pointer shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://cdn.packhacker.com/2022/07/f1b89bdb-travel-tech-acc-featured.jpg"
                    alt="Accessories"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-center"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors pointer-events-none" />
                  <div className="relative z-10 p-4 text-white flex flex-col items-center">
                    <h3 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">Accessories</h3>
                    <Link href="/shop?category=accessories" className="text-xs md:text-sm font-semibold hover:underline inline-flex items-center gap-1 group/link text-white/90">
                      Explore <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Bottom Right - Centered Text (Now Headphones) */}
                <div className="rounded-2xl relative overflow-hidden flex flex-col justify-center items-center text-center h-full group cursor-pointer shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://dlifestylesg.com/cdn/shop/files/ULT_WEAR_Black_Standard-Large_1200x.jpg?v=1712806803"
                    alt="Headphones"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-center"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors pointer-events-none" />
                  <div className="relative z-10 p-4 text-white flex flex-col items-center">
                    <h3 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">Headphones</h3>
                    <Link href="/collections/headphones" className="text-xs md:text-sm font-semibold hover:underline inline-flex items-center gap-1 group/link text-white/90">
                      Explore <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Popular Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {displayPopularProducts.length > 0 ? (
              displayPopularProducts.map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">No popular products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Promo Banner Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-[#1A1C23] to-[#2D3340] rounded-xl overflow-hidden relative flex flex-col md:flex-row items-center h-auto md:h-[400px]">
            <div className="md:w-1/2 relative h-[300px] md:h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80"
                alt="Promo"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="md:w-1/2 p-8 md:p-16 text-white bg-[#F5F5F5] md:bg-transparent text-black md:text-white h-full flex flex-col justify-center">
              <p className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-wider">Promotion</p>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black md:text-white">
                Hurry up! 40% OFF
              </h2>
              <p className="text-gray-600 md:text-gray-300 mb-8 max-w-md">
                Thousands of high tech are waiting for you
              </p>

              <div className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">02</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">12</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">46</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white text-black w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-xl">06</div>
                  <span className="text-[10px] mt-1 md:text-gray-300 text-gray-600">Seconds</span>
                </div>
              </div>

              <div>
                <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "bg-black hover:bg-gray-800 text-white md:bg-white md:text-black md:hover:bg-gray-200 px-8 rounded-md h-12")}>
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Feedback Section */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-black">What Our Customers Say</h2>
            <p className="text-gray-500 text-lg">Real reviews from our verified buyers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "The noise cancellation on the Sony WH-1000XM5 is absolutely unreal. It completely blocks out my noisy office. Best purchase I've made this year!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  AD
                </div>
                <div>
                  <h4 className="font-bold text-black">Alex D.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "Incredible sound quality and the battery life lasts for days. Highly recommend Gadget Mart for their blazing fast shipping and great packaging."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl">
                  SM
                </div>
                <div>
                  <h4 className="font-bold text-black">Sarah M.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
              <div className="text-blue-500 text-4xl font-serif absolute top-6 right-8 opacity-20">"</div>
              <div className="flex text-yellow-400 text-lg mb-4">
                ★★★★★
              </div>
              <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                "I was skeptical about the new Beats, but they fit perfectly and the bass is incredibly punchy without being overwhelming. 10/10."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                  JT
                </div>
                <div>
                  <h4 className="font-bold text-black">James T.</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px]">✓</span>
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-8 bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 overflow-hidden">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-4 md:gap-6 pb-4 pt-2 snap-x snap-mandatory mask-image-linear-gradient">
            {/* Apple */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiApple className="h-10 md:h-12 w-auto text-black" />
            </div>
            {/* JBL */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiJbl className="h-10 md:h-12 w-auto text-[#ff3300]" />
            </div>
            {/* Sharge */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-1 font-black text-xl italic tracking-tighter">
                <Zap className="h-6 w-6 fill-current text-black" /> SHARGE
              </div>
            </div>
            {/* Xiaomi */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiXiaomi className="h-10 md:h-12 w-auto text-[#ff6900]" />
            </div>
            {/* Marshall */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="font-bold text-2xl md:text-3xl tracking-tighter" style={{ fontFamily: 'cursive', transform: 'rotate(-5deg)' }}>Marshall</span>
            </div>
            {/* Sony */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiSony className="w-20 md:w-28 h-auto text-black" />
            </div>
            {/* Samsung */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiSamsung className="w-20 md:w-28 h-auto text-black" />
            </div>
            {/* Fitbit */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiFitbit className="h-8 md:h-10 w-auto text-[#00B0B9]" />
            </div>
            {/* Anker */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="text-xl md:text-2xl font-black tracking-widest text-[#00a9e0]">ANKER</span>
            </div>
            {/* Bose */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <SiBose className="h-6 md:h-7 w-auto text-black italic" />
            </div>
            {/* Google */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <FcGoogle className="h-10 md:h-12 w-auto" />
            </div>
            {/* Haylou */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center justify-center p-4 flex-shrink-0 w-32 md:w-44 h-24 snap-center hover:scale-105 transition-transform cursor-pointer">
              <span className="text-lg md:text-xl font-medium tracking-[0.2em] text-[#00A9E0]">H A Y L O U</span>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />
      </section>

    </div>
  );
}
