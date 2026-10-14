import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { AddProductDialog } from "./add-product-dialog";
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { getProducts, getCategories, getCollections } from "@/lib/api";
import { deleteProduct } from "./actions";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q : "";
  const filter = typeof searchParams?.filter === "string" ? searchParams.filter : "";

  let allProducts: any[] = [];
  try {
    allProducts = await getProducts({ cache: "no-store" });
  } catch (err) {
    console.warn("Error fetching admin products:", err);
    allProducts = [];
  }

  let categories: any[] = [];
  try {
    categories = await getCategories({ cache: "no-store" });
  } catch {
    categories = [];
  }

  if (!categories || categories.length === 0) {
    const categoryNames = Array.from(
      new Set(
        allProducts
          .map((p) => (typeof p.category === "object" ? p.category?.name : p.category))
          .filter(Boolean)
      )
    );
    categories = categoryNames.map((name) => ({
      id: String(name),
      name: String(name),
    }));
  }

  let collections: any[] = [];
  try {
    collections = await getCollections({ cache: "no-store" });
  } catch {
    collections = [
      { id: "featured", name: "Featured" },
      { id: "new-arrivals", name: "New Arrivals" },
      { id: "best-sellers", name: "Best Sellers" },
    ];
  }

  let filteredProducts = allProducts;
  if (search) {
    const s = search.toLowerCase();
    filteredProducts = filteredProducts.filter((p) => (p.name || "").toLowerCase().includes(s));
  }
  if (filter && filter !== "all") {
    filteredProducts = filteredProducts.filter((p) => {
      const catName = typeof p.category === "object" ? p.category?.name : p.category;
      return String(catName).toLowerCase() === filter.toLowerCase();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <AddProductDialog categories={categories} collections={collections} />
      </div>

      <DataTableToolbar 
        searchPlaceholder="Search products by name..." 
        filterOptions={categories.map((c) => ({ label: c.name, value: c.name }))}
        filterPlaceholder="All Categories"
      />

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img?.is_primary)?.image_url 
                                    || product.images?.[0]?.image_url 
                                    || (typeof product.images?.[0] === "string" ? product.images[0] : null)
                                    || product.imageUrl
                                    || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80";

                const categoryObj = categories.find((c) => c.id === product.category || c._id === product.category || c.name === product.category);
                const categoryName = categoryObj ? categoryObj.name : (typeof product.category === "object" ? product.category?.name : product.category);
                const stockQty = product.countInStock !== undefined ? product.countInStock : (product.stock || 0);

                return (
                  <TableRow key={product.id || product._id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {product.is_popular && (
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                            Popular
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{categoryName || "General"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={stockQty > 10 ? "default" : "destructive"}>
                        {stockQty} in stock
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!product.isRemoved ? (
                        <span className="flex items-center text-sm text-green-500"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Active</span>
                      ) : (
                        <span className="flex items-center text-sm text-muted-foreground"><span className="h-2 w-2 rounded-full bg-muted-foreground mr-2"></span>Draft</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/products/${product.id || product._id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="h-4 w-4" />
                      </Link>
                      <AdminDeleteButton
                        id={product.id || product._id}
                        name={product.name}
                        action={deleteProduct}
                        title="Delete product"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
