"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addProduct } from "./actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { toast } from "sonner";

export function AddProductDialog({ categories, collections }: { categories: any[], collections?: any[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugTouched) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugTouched(true);
    setSlug(
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "")
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStagedFiles([]);
      setImageUrl("");
      setName("");
      setSlug("");
      setIsSlugTouched(false);
      formRef.current?.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const token = useAuthStore.getState().token;

      // Ensure all staged device files are included in the FormData
      stagedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (imageUrl) {
        formData.set("image_url", imageUrl);
      }

      await addProduct(formData, token);
      toast.success("Product created successfully!");
      setStagedFiles([]);
      setImageUrl("");
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to add product:", err);
      toast.error(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" /> Add Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Product Name</label>
              <input 
                id="name" name="name" required type="text"
                value={name}
                onChange={handleNameChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. iPhone 16 Pro"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="slug">
                URL Slug <span className="text-xs text-muted-foreground font-normal">(Auto-generated or custom)</span>
              </label>
              <input 
                id="slug" name="slug" required type="text"
                value={slug}
                onChange={handleSlugChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
                placeholder="e.g. iphone-16-pro"
              />
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
              <label className="text-sm font-medium" htmlFor="old_price">Old Price (Rs.) (Optional)</label>
              <input 
                id="old_price" name="old_price" type="number" step="0.01" min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="1099.99"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="stock">Stock Quantity</label>
              <input 
                id="stock" name="stock" required type="number" min="0" defaultValue="100"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category">Category</label>
              <select 
                id="category" name="category" required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="none">Select Category...</option>
                {categories?.map(cat => (
                  <option key={cat.id || cat._id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="collection_id">Collection (Optional)</label>
              <select 
                id="collection_id" name="collection_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="none">None</option>
                {collections?.map(col => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
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
            
            <div className="space-y-2 flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_popular" 
                  id="is_popular"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium">Mark as Popular Product</span>
              </label>
              <p className="text-xs text-muted-foreground ml-6">This will show the product in the Popular Products section on the homepage.</p>
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
      </DialogContent>
    </Dialog>
  );
}
