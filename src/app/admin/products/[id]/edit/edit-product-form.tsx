"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { updateProduct } from "../../actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

export function EditProductForm({
  product,
  categories,
}: {
  product: any;
  categories: Category[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  // Extract initial existing image URLs
  const initialImages: string[] = Array.from(
    new Set(
      (product.images || [])
        .map((img: any) => (typeof img === "string" ? img : img?.image_url))
        .concat(product.imageUrl ? [product.imageUrl] : [])
        .filter((url: any): url is string => Boolean(url && typeof url === "string"))
    )
  );

  const [existingImages] = useState<string[]>(initialImages);
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([]);

  const handleToggleRemoveExistingImage = (url: string) => {
    setRemovedExistingImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const token = useAuthStore.getState().token;

      // Add product ID
      const productId = product.id || product._id;
      formData.set("id", productId);

      // Append new files staged from device
      stagedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Append existing images marked for removal
      removedExistingImages.forEach((imgUrl) => {
        formData.append("removeImages", imgUrl);
      });

      // Append retained existing images
      const retainedImages = existingImages.filter(
        (url) => !removedExistingImages.includes(url)
      );
      retainedImages.forEach((imgUrl) => {
        formData.append("existingImages", imgUrl);
      });

      if (imageUrl) {
        formData.set("image_url", imageUrl);
      }

      await updateProduct(formData, token);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Product update error:", err);
      toast.error(err.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category || "General";
  const stockQty =
    product.countInStock !== undefined
      ? product.countInStock
      : product.stock || 0;

  const categoryList = categories.some((c) => c.name === categoryName || c.id === categoryName)
    ? categories
    : [...categories, { id: categoryName, name: categoryName }];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={product.id || product._id} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            required
            type="text"
            defaultValue={product.name}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={categoryName}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="none">Select Category...</option>
            {categoryList.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="price">
            Price (Rs.)
          </label>
          <input
            id="price"
            name="price"
            required
            type="number"
            step="0.01"
            min="0"
            defaultValue={product.price ? product.price / 100 : 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="stock">
            Stock Quantity
          </label>
          <input
            id="stock"
            name="stock"
            required
            type="number"
            min="0"
            defaultValue={stockQty}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <ProductImageUploader
        stagedFiles={stagedFiles}
        onStagedFilesChange={setStagedFiles}
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        existingImages={existingImages}
        removedExistingImages={removedExistingImages}
        onRemoveExistingImage={handleToggleRemoveExistingImage}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product.description || ""}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating Product..." : "Update Product"}
      </Button>
    </form>
  );
}
