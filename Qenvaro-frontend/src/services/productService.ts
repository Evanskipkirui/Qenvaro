// ============================================================
// PRODUCT SERVICE
// ============================================================
// Handles all product data — from the real Go backend when it
// is running, or from mock data when it is not.
//
// HOW IT WORKS:
//   Every function tries the real API first.
//   If the request fails (backend not running), it falls back
//   to mock data so the frontend still works standalone.
//
// FUTURE: Remove the fallback once the backend is always running.
// ============================================================

import { Product } from '../types';
import { apiRequest } from './api';
import { mockProducts } from '../data/products';

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
  try {
    const data = await apiRequest<BackendProduct[]>('/products');
    return data.map(mapProduct);
  } catch {
    // Backend not available — use mock data
    console.warn('Backend unavailable — using mock products');
    return mockProducts;
  }
}

// ── GET /api/products/:id ────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const data = await apiRequest<BackendProduct>(`/products/${id}`);
    return mapProduct(data);
  } catch {
    // Fall back to finding in mock data
    return mockProducts.find((p) => p.id === id) ?? null;
  }
}

// ── POST /api/products (admin only) ─────────────────────────
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews' | 'featured'>
): Promise<Product> {
  try {
    const result = await apiRequest<BackendProduct>('/products', {
      method: 'POST',
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
  } catch (err) {
    // If backend is running but returned an error, re-throw it
    // If backend is just offline, create a mock product locally
    if (err instanceof Error && err.message.includes('API error')) throw err;
    const now = new Date().toISOString();
    return { ...data, id: Date.now(), rating: 0, reviews: 0, featured: false, createdAt: now, updatedAt: now };
  }
}

// ── PUT /api/products/:id (admin only) ───────────────────────
export async function updateProduct(
  id: number,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product> {
  try {
    const result = await apiRequest<BackendProduct>(`/products/${id}`, {
      method: 'PUT',
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
  } catch (err) {
    if (err instanceof Error && err.message.includes('API error')) throw err;
    const existing = mockProducts.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');
    return { ...existing, ...data, updatedAt: new Date().toISOString() };
  }
}

// ── DELETE /api/products/:id (admin only) ────────────────────
export async function deleteProduct(id: number): Promise<void> {
  try {
    await apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    if (err instanceof Error && err.message.includes('API error')) throw err;
    // Backend offline — deletion handled locally in context
    console.warn(`Mock: product ${id} deleted locally only`);
  }
}
