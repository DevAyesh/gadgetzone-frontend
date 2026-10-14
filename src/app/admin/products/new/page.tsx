"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addProduct } from "../actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { toast } from "sonner";

const categories = [
  { id: "Smartphones", name: "Smartphones" },
  { id: "Laptops", name: "Laptops" },
  { id: "Audio", name: "Audio" },
  { id: "Wearables", name: "Wearables" },
  { id: "Cameras", name: "Cameras" },
  { id: "Gaming", name: "Gaming" },
  { id: "Accessories", name: "Accessories" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const token = useAuthStore.getState().token;

      // Append staged files from device
      stagedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (imageUrl) {
        formData.set("image_url", imageUrl);
      }

      await addProduct(formData, token);
      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Product creation error:", err);
      toast.error(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">Product Name</label>
                <input 
                  id="name" name="name" required type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. iPhone 16 Pro"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category">Category</label>
                <select 
                  id="category" name="category" required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="none">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">Price (Rs.)</label>
                <input 
                  id="price" name="price" required type="number" step="0.01" min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="999.99"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stock">Stock Quantity</label>
                <input 
                  id="stock" name="stock" required type="number" min="0" defaultValue="100"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor="badge">Product Badge</label>
                <select 
                  id="badge" name="badge" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="NONE">None</option>
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>
            </div>

            <ProductImageUploader
              stagedFiles={stagedFiles}
              onStagedFilesChange={setStagedFiles}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">Description</label>
              <textarea 
                id="description" name="description" rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Product description..."
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving Product..." : "Save Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
