import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const filter = typeof searchParams?.filter === 'string' ? searchParams.filter : '';
  const supabase = await createClient();
  
  // Fetch orders with user profiles to get customer names
  let query = supabase
    .from("orders")
    .select(`
      *,
      profiles(first_name, last_name, id)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("order_number", `%${search}%`);
  }

  if (filter && filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <DataTableToolbar 
            searchPlaceholder="Search by order number..." 
            filterOptions={[
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
              { label: "Cancelled", value: "cancelled" }
            ]}
            filterPlaceholder="All Statuses"
          />
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => {
                // @ts-ignore - Supabase types might not know about the join properly depending on generation
                const customerName = order.profiles 
                  ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Unknown Customer'
                  : 'Guest User';

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">
                      <Link href={`/admin/orders/${order.id}`}>
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{customerName}</span>
                        <span className="text-xs text-muted-foreground">Guest</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>
                      <div className="w-[140px]">
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" /> View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
