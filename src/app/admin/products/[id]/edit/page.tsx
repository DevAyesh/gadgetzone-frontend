import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import { EditProductForm } from "./edit-product-form";

export const dynamic = 'force-dynamic';

const categories = [
  { id: "Smartphones", name: "Smartphones" },
  { id: "Laptops", name: "Laptops" },
  { id: "Audio", name: "Audio" },
  { id: "Wearables", name: "Wearables" },
  { id: "Cameras", name: "Cameras" },
  { id: "Gaming", name: "Gaming" },
  { id: "Accessories", name: "Accessories" },
];

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  let product: any = null;
  try {
    product = await getProductById(params.id);
  } catch (err) {
    console.warn("Product not found:", err);
    notFound();
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProductForm product={product} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
