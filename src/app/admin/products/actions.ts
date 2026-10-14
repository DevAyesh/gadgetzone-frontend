"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function addProduct(formData: FormData, token?: string | null) {
  const tokenVal = token || (formData.get("token") as string | null);

  const name = formData.get("name") as string;
  const category_id = formData.get("category_id") as string;
  const category = (formData.get("category") as string) || (category_id && category_id !== "none" ? category_id : "General");
  const priceInput = formData.get("price") as string;
  const price = priceInput ? Math.round(parseFloat(priceInput) * 100) : 0;
  const stockInput = formData.get("stock") as string;
  const stock = stockInput ? parseInt(stockInput, 10) : 100;
  const description = (formData.get("description") as string) || "No description provided";
  const image_url = formData.get("image_url") as string;
  const slug = formData.get("slug") as string;

  const backendFormData = new FormData();
  backendFormData.append("name", name);
  backendFormData.append("category", category);
  backendFormData.append("price", String(price));
  backendFormData.append("countInStock", String(stock));
  backendFormData.append("description", description);
  if (slug) {
    backendFormData.append("slug", slug);
  }
  if (image_url) {
    backendFormData.append("image_url", image_url);
  }

  // Append any uploaded image files from device
  const files = formData.getAll("images");
  for (const item of files) {
    if (item instanceof File && item.size > 0) {
      backendFormData.append("images", item);
    }
  }
  const altFiles = formData.getAll("imageFiles");
  for (const item of altFiles) {
    if (item instanceof File && item.size > 0) {
      backendFormData.append("images", item);
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (tokenVal) {
    headers["Authorization"] = `Bearer ${tokenVal}`;
  }

  const res = await fetch(`${API_URL}/api/products/admin`, {
    method: "POST",
    headers,
    body: backendFormData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      data.message ||
      (Array.isArray(data.errors) ? data.errors.join(", ") : "Failed to create product");
    console.error("Error creating product:", errorMsg);
    throw new Error(errorMsg);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return data;
}

export async function deleteProduct(formData: FormData, token?: string | null) {
  const id = formData.get("id") as string;
  const tokenVal = token || (formData.get("token") as string | null);
  if (!id) return;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (tokenVal) {
    headers["Authorization"] = `Bearer ${tokenVal}`;
  }

  try {
    await fetch(`${API_URL}/api/products/admin/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
  } catch (err) {
    console.error("Delete product error:", err);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function updateProduct(formData: FormData, token?: string | null) {
  const id = formData.get("id") as string;
  const tokenVal = token || (formData.get("token") as string | null);
  if (!id) {
    throw new Error("Product ID is required for update");
  }

  const name = formData.get("name") as string;
  const category_id = formData.get("category_id") as string;
  const category = (formData.get("category") as string) || (category_id && category_id !== "none" ? category_id : "General");
  const priceInput = formData.get("price") as string;
  const price = priceInput ? Math.round(parseFloat(priceInput) * 100) : 0;
  const stockInput = formData.get("stock") as string;
  const stock = stockInput ? parseInt(stockInput, 10) : 0;
  const description = (formData.get("description") as string) || "";
  const image_url = formData.get("image_url") as string;
  const slug = formData.get("slug") as string;

  const backendFormData = new FormData();
  backendFormData.append("name", name);
  backendFormData.append("category", category);
  backendFormData.append("price", String(price));
  backendFormData.append("countInStock", String(stock));
  backendFormData.append("description", description);
  if (slug) {
    backendFormData.append("slug", slug);
  }
  if (image_url) {
    backendFormData.append("image_url", image_url);
  }

  const files = formData.getAll("images");
  for (const item of files) {
    if (item instanceof File && item.size > 0) {
      backendFormData.append("images", item);
    }
  }
  const altFiles = formData.getAll("imageFiles");
  for (const item of altFiles) {
    if (item instanceof File && item.size > 0) {
      backendFormData.append("images", item);
    }
  }

  const removeImages = formData.getAll("removeImages");
  for (const rImg of removeImages) {
    if (typeof rImg === "string" && rImg) {
      backendFormData.append("removeImages", rImg);
    }
  }

  const existingImages = formData.getAll("existingImages");
  for (const eImg of existingImages) {
    if (typeof eImg === "string" && eImg) {
      backendFormData.append("existingImages", eImg);
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (tokenVal) {
    headers["Authorization"] = `Bearer ${tokenVal}`;
  }

  const res = await fetch(`${API_URL}/api/products/admin/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers,
    body: backendFormData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg =
      data.message ||
      (Array.isArray(data.errors) ? data.errors.join(", ") : "Failed to update product");
    console.error("Update product error:", errorMsg);
    throw new Error(errorMsg);
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return data;
}
