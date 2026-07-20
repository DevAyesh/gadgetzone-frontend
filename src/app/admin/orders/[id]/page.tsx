// @ts-nocheck
const mq = { select:function(){return this}, eq:function(){return this}, order:function(){return this}, limit:function(){return this}, single:async function(){return {data:null,error:null}}, ilike:function(){return this}, returns:function(){return this}, then:function(cb: any){cb({data:[],error:null})} };
const createClient = async () => ({ from: () => mq, insert: () => mq, update: () => mq, delete: () => mq, auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { OrderStatusUpdate } from "@/components/admin/order-status-update";


export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const orderId = params.id;
  
  // Create an admin client to bypass all RLS for the admin dashboard
  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : await createClient();

  // Fetch order with user info and items
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles(first_name, last_name, phone),
      order_items(
        id,
        quantity,
        price,
        products(
          name,
          images:product_images(image_url, is_primary)
        )
      )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    console.error("Order fetch error:", error);
    return notFound();
  }

  const customerName = order.profiles 
    ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Guest'
    : 'Guest';
  
  const customerEmail = order.profiles?.email || 'Guest';

  // Format Date (e.g. 10 Jul 2026, 02:56 PM)
  const orderDate = new Date(order.created_at).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Order <span className="text-blue-600">{order.order_number}</span>
        </h1>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="bg-muted/50 gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      {/* 3-Column Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Customer</h3>
          <p className="font-semibold text-foreground">{customerName}</p>
          <p className="text-sm text-muted-foreground mt-1">{customerEmail}</p>
        </div>
        
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Shipping Address</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {order.notes?.replace('Shipping Info: ', '') || 'No shipping details provided.'}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Payment</h3>
          <p className="font-semibold capitalize text-foreground">{order.payment_method}</p>
          <p className="text-sm text-muted-foreground mt-1">{orderDate}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="pb-4 font-bold">Product</th>
              <th className="pb-4 font-bold">Qty</th>
              <th className="pb-4 font-bold">Unit Price</th>
              <th className="pb-4 font-bold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {order.order_items?.map((item: any) => {
              const product = item.products;
              const primaryImage = product?.images?.find((img: any) => img.is_primary)?.image_url 
                || product?.images?.[0]?.image_url 
                || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&q=80";

              return (
                <tr key={item.id} className="group">
                  <td className="py-4 flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                      <Image src={primaryImage} alt={product?.name || "Product"} fill className="object-cover" />
                    </div>
                    <span className="font-medium">{product?.name || "Unknown Product"}</span>
                  </td>
                  <td className="py-4 text-muted-foreground">{item.quantity}</td>
                  <td className="py-4 text-muted-foreground">{formatPrice(item.price)}</td>
                  <td className="py-4 font-semibold">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Total: <span className="text-blue-600">{formatPrice(order.total_amount)}</span>
        </h2>
        
        <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Notes Box */}
      <div className="mt-8 bg-muted/30 border border-border/50 p-4 rounded-lg">
        <p className="text-sm font-medium text-foreground mb-1">Notes: <span className="text-muted-foreground font-normal">\\p\\</span></p>
      </div>

    </div>
  );
}
