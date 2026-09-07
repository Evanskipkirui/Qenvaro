// ============================================================
// MOCK ORDER DATA
// ============================================================
// These are fake orders used on the My Orders and Admin pages.
// When the Go API is ready, these will be replaced by
// real data from GET /api/orders
// ============================================================

import { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 1,
    customerName: 'Alex Johnson',
    customerEmail: 'alex@example.com',
    items: [
      { productId: 1, productName: 'ProBook Laptop 15', quantity: 1, price: 1299.99 },
      { productId: 7, productName: 'MechaType RGB Keyboard', quantity: 1, price: 129.99 },
    ],
    total: 1429.98,
    status: 'delivered',
    date: '2026-07-10',
    deliveryAddress: '123 Main Street',
    city: 'Nairobi',
  },
  {
    id: 'ORD-002',
    customerId: 1,
    customerName: 'Alex Johnson',
    customerEmail: 'alex@example.com',
    items: [
      { productId: 5, productName: 'SoundWave Pro Headphones', quantity: 2, price: 249.99 },
    ],
    total: 499.98,
    status: 'shipped',
    date: '2026-08-01',
    deliveryAddress: '123 Main Street',
    city: 'Nairobi',
  },
  {
    id: 'ORD-003',
    customerId: 2,
    customerName: 'Maria Wanjiku',
    customerEmail: 'maria@example.com',
    items: [
      { productId: 3, productName: 'Galaxy Pro S25', quantity: 1, price: 849.99 },
      { productId: 11, productName: 'ErgoDesk USB Hub', quantity: 1, price: 49.99 },
    ],
    total: 899.98,
    status: 'processing',
    date: '2026-08-20',
    deliveryAddress: '45 Westlands Ave',
    city: 'Nairobi',
  },
  {
    id: 'ORD-004',
    customerId: 3,
    customerName: 'Brian Omondi',
    customerEmail: 'brian@example.com',
    items: [
      { productId: 9, productName: 'ViewMax 27" 4K Monitor', quantity: 1, price: 499.99 },
    ],
    total: 499.99,
    status: 'pending',
    date: '2026-08-30',
    deliveryAddress: '8 Kilimani Road',
    city: 'Kisumu',
  },
  {
    id: 'ORD-005',
    customerId: 4,
    customerName: 'Diana Njeri',
    customerEmail: 'diana@example.com',
    items: [
      { productId: 6, productName: 'BassBoost Wireless Earbuds', quantity: 1, price: 89.99 },
      { productId: 8, productName: 'SlimKey Wireless Keyboard', quantity: 1, price: 59.99 },
      { productId: 12, productName: 'PrecisionClick Pro Mouse', quantity: 1, price: 79.99 },
    ],
    total: 229.97,
    status: 'cancelled',
    date: '2026-08-25',
    deliveryAddress: '17 Mombasa Road',
    city: 'Mombasa',
  },
];
