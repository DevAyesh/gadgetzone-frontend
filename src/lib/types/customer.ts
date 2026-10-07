/**
 * Monetary amounts returned by the customer product API are represented in
 * integer minor units (for example, 149999 represents Rs. 1,499.99).
 */
export type PriceInMinorUnits = number;

export interface ProductImage {
  image_url: string;
  is_primary?: boolean;
}

export interface ProductCategory {
  id?: string;
  name: string;
  slug: string;
}

export interface ProductCollection {
  id?: string;
  name: string;
  slug: string;
}

/**
 * Product shape consumed by customer UI after it is returned by the backend.
 *
 * category and collection remain nullable because the existing storefront
 * already supports products without either relation.
 */
export interface CustomerProduct {
  id: string;
  name: string;
  slug: string;
  price: PriceInMinorUnits;
  old_price?: PriceInMinorUnits | null;
  description?: string | null;
  badge?: string | null;
  stock?: number | null;
  countInStock?: number | null;
  category?: ProductCategory | string | null;
  collection?: ProductCollection | string | null;
  images?: ProductImage[];
  imageUrl?: string | null;
}

/**
 * Backend responses observed in the storefront may identify products with
 * either id or _id. The API layer normalizes that difference before data
 * reaches customer UI.
 */
export interface CustomerProductApiResponse extends Omit<CustomerProduct, "id"> {
  id?: string;
  _id?: string;
}

/** The normalized product list used by customer UI. */
export type CustomerProductsResponse = CustomerProduct[];

/** The normalized product used by customer UI. */
export type CustomerProductResponse = CustomerProduct;

/** The currently evidenced /api/products response: a product array. */
export type CustomerProductsApiResponse = CustomerProductApiResponse[];
