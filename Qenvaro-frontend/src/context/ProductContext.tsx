// ============================================================
// PRODUCT CONTEXT
// ============================================================
// WHAT IS THIS?
//   React Context is a way to share data across the whole app
//   without passing it down manually through every component.
//
// WHY DO WE NEED IT?
//   The Products list, Add page, Edit page, and Detail page
//   all need to work with the same products. If we stored
//   products only in the Products page, the Edit page wouldn't
//   know about them. Context solves this by creating a single
//   shared "store" that any component can read or update.
//
// HOW TO USE IT:
//   Any component can call useProducts() to get:
//     - products      → the current list of products
//     - addProduct    → function to create a new product
//     - updateProduct → function to update an existing one
//     - deleteProduct → function to remove one by id
//     - getProductById → function to find one product by id
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import {
  getProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from '../services/productService';

// ── 1. Define the shape of what the context provides ────────
interface ProductContextType {
  products: Product[];
  loadingProducts: boolean;
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews' | 'featured'>) => Promise<Product>;
  updateProduct: (id: number, data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews' | 'featured'>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
}

// ── 2. Create the context object ─────────────────────────────
// The "null" here is just a default — it gets replaced by the
// real value inside ProductProvider below.
const ProductContext = createContext<ProductContextType | null>(null);

// ── 3. The Provider component ────────────────────────────────
// Wrap your app (or the part that needs products) with this.
// It holds the actual state and passes it down via context.
export function ProductProvider({ children }: { children: React.ReactNode }) {
  // Start empty — we load from the real API on mount
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load all products from GET /api/products when the app starts
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoadingProducts(false));
  }, []);

  // CREATE: POST /api/products then add to local state
  async function addProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews' | 'featured'>
  ): Promise<Product> {
    const newProduct = await apiCreateProduct(data);
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  }

  // UPDATE: PUT /api/products/:id then update local state
  async function updateProduct(
    id: number,
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews' | 'featured'>
  ): Promise<void> {
    const updated = await apiUpdateProduct(id, data);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
  }

  // DELETE: DELETE /api/products/:id then remove from local state
  async function deleteProduct(id: number): Promise<void> {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  // READ single: find in local state first, fall back to API
  function getProductById(id: number): Product | undefined {
    return products.find((p) => p.id === id);
  }

  const value: ProductContextType = {
    products,
    loadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

// ── 4. Custom hook ───────────────────────────────────────────
// Instead of calling useContext(ProductContext) everywhere,
// we wrap it in a named hook. Cleaner and gives a helpful error
// if someone forgets to add the Provider.
//
// Usage in any component:
//   const { products, deleteProduct } = useProducts();
export function useProducts(): ProductContextType {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used inside a ProductProvider');
  }
  return context;
}
