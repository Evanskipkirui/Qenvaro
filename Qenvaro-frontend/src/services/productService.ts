// ============================================================
// PRODUCT SERVICE
// ============================================================
// Handles all product data from the Go backend.
// ============================================================

import { Product } from "../types";
import { apiRequest } from "./api";

// ── Backend response shape ───────────────────────────────────
// The backend uses snake_case (created_at) while the frontend
// uses camelCase (createdAt). mapProduct() handles conversion.
interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

function mapProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    stock: p.stock,
    rating: 0,
    reviews: 0,
    featured: false,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// ── GET /api/products ────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const data = await apiRequest<BackendProduct[]>("/products");
  return data.map(mapProduct);
}

// ── GET /api/products/:id ────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  const data = await apiRequest<BackendProduct>(`/products/${id}`);
  return mapProduct(data);
}

// ── POST /api/products (admin only) ─────────────────────────
export async function createProduct(
  data: Omit<
    Product,
    "id" | "createdAt" | "updatedAt" | "rating" | "reviews" | "featured"
  >,
): Promise<Product> {
  const result = await apiRequest<BackendProduct>("/products", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      stock: data.stock,
    }),
  });
  return mapProduct(result);
}

// ── PUT /api/products/:id (admin only) ───────────────────────
export async function updateProduct(
  id: number,
  data: Partial<Omit<Product, "id" | "createdAt">>,
): Promise<Product> {
  const result = await apiRequest<BackendProduct>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image,
      category: data.category,
      stock: data.stock,
    }),
  });
  return mapProduct(result);
}

// ── DELETE /api/products/:id (admin only) ────────────────────
export async function deleteProduct(id: number): Promise<void> {
  await apiRequest<void>(`/products/${id}`, { method: "DELETE" });
}
