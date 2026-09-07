// ============================================================
// ORDER SERVICE
// ============================================================
// Tries the real Go backend first.
// Falls back to mock order data when the backend is not running.
// ============================================================

import { Order, CartItem, CheckoutForm } from '../types';
import { apiRequest } from './api';
import { mockOrders } from '../data/orders';

interface BackendOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

interface BackendOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  items?: BackendOrderItem[];
}

function mapOrder(o: BackendOrder): Order {
  return {
    id: String(o.id),
    customerId: o.user_id,
    customerName: '',
    customerEmail: '',
    items: (o.items ?? []).map((item) => ({
      productId: item.product_id,
      productName: '',
      quantity: item.quantity,
      price: item.price,
    })),
    total: o.total_amount,
    status: o.status as Order['status'],
    date: o.created_at.split('T')[0],
    deliveryAddress: '',
    city: '',
  };
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── GET /api/orders (customer sees own, admin sees all) ──────
export async function getMyOrders(customerId: number): Promise<Order[]> {
  try {
    const data = await apiRequest<BackendOrder[]>('/orders');
    return data.map(mapOrder);
  } catch {
    console.warn('Backend unavailable — using mock orders');
    await delay(400);
    return mockOrders.filter((o) => o.customerId === customerId);
  }
}

// ── GET /api/orders (admin: all orders) ──────────────────────
export async function getAllOrders(): Promise<Order[]> {
  try {
    const data = await apiRequest<BackendOrder[]>('/orders');
    return data.map(mapOrder);
  } catch {
    console.warn('Backend unavailable — using mock orders');
    await delay(400);
    return mockOrders;
  }
}

// ── GET /api/orders/:id ──────────────────────────────────────
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const data = await apiRequest<BackendOrder>(`/orders/${id}`);
    return mapOrder(data);
  } catch {
    return mockOrders.find((o) => o.id === id) ?? null;
  }
}

// ── POST /api/orders ─────────────────────────────────────────
export async function placeOrder(
  _form: CheckoutForm,
  cartItems: CartItem[],
  _customerId: number
): Promise<Order> {
  try {
    const data = await apiRequest<BackendOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cartItems.map((ci) => ({
          product_id: ci.product.id,
          quantity: ci.quantity,
        })),
      }),
    });
    return mapOrder(data);
  } catch (err) {
    // Re-throw real backend errors (product not found, out of stock, etc.)
    if (err instanceof Error && err.message.includes('API error')) throw err;
    // Backend offline — create a mock order locally
    console.warn('Backend unavailable — creating mock order');
    await delay(700);
    const total = cartItems.reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
    return {
      id: `ORD-${Date.now()}`,
      customerId: _customerId,
      customerName: _form.fullName,
      customerEmail: _form.email,
      items: cartItems.map((ci) => ({
        productId: ci.product.id,
        productName: ci.product.name,
        quantity: ci.quantity,
        price: ci.product.price,
      })),
      total,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      deliveryAddress: _form.address,
      city: _form.city,
    };
  }
}
