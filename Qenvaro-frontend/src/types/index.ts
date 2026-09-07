// ============================================================
// TYPES / INTERFACES
// ============================================================
// TypeScript interfaces define the "shape" of our data objects.
// Think of them as contracts: if something is a Product, it MUST
// have all these fields with the correct types.
// This prevents bugs like typos or wrong data types at compile time.
// ============================================================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;          // price in USD
  category: string;
  image: string;          // URL or path to image
  stock: number;          // how many items are available
  rating: number;         // average rating 0-5
  reviews: number;        // total number of reviews
  featured: boolean;      // show on homepage?
  createdAt: string;      // ISO date string e.g. "2026-01-15T10:30:00Z"
  updatedAt: string;      // ISO date string — updated whenever the product is edited
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'customer' | 'admin'; // 'customer' or 'admin' — no other values allowed
}

// CartItem = a Product + how many the user wants
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;            // ISO date string e.g. "2026-01-15"
  deliveryAddress: string;
  city: string;
}

// Used by the checkout form
export interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}
