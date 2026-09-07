// ============================================================
// MOCK PRODUCT DATA
// ============================================================
// This file contains fake products used while the backend
// does not exist yet.
//
// WHY a separate file?
//   Keeping data here (not inside components) means you only
//   need to change one place when the real API is ready.
//
// FUTURE: replace this with a real call to GET /api/products
// from the Go + Gin backend.
// ============================================================

import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'ProBook Laptop 15',
    description:
      'A powerful 15-inch laptop with Intel Core i7, 16GB RAM, and 512GB SSD. Perfect for developers and creatives who need performance on the go.',
    price: 1299.99,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    stock: 12,
    rating: 4.5,
    reviews: 128,
    featured: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'UltraSlim Laptop 13',
    description:
      'A featherlight 13-inch laptop designed for professionals on the move. Boasts 10-hour battery life and a stunning OLED display.',
    price: 999.99,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
    stock: 8,
    rating: 4.3,
    reviews: 95,
    featured: false,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 3,
    name: 'Galaxy Pro S25',
    description:
      'Flagship Android smartphone with a 6.7-inch AMOLED display, 200MP camera, and 5G connectivity. Comes with 256GB storage.',
    price: 849.99,
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop',
    stock: 25,
    rating: 4.7,
    reviews: 312,
    featured: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-08-05T14:00:00Z',
  },
  {
    id: 4,
    name: 'iPhone 16 Mini',
    description:
      'Compact yet powerful. The iPhone 16 Mini packs Apple Silicon A18, a brilliant 5.4-inch screen, and all-day battery into a small form factor.',
    price: 729.99,
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=300&fit=crop',
    stock: 0,
    rating: 4.6,
    reviews: 241,
    featured: false,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-07-18T09:30:00Z',
  },
  {
    id: 5,
    name: 'SoundWave Pro Headphones',
    description:
      'Over-ear wireless headphones with active noise cancellation, 30-hour battery, and Hi-Fi audio. Ideal for music lovers and remote workers.',
    price: 249.99,
    category: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    stock: 40,
    rating: 4.8,
    reviews: 523,
    featured: true,
    createdAt: '2026-03-01T08:30:00Z',
    updatedAt: '2026-08-10T16:00:00Z',
  },
  {
    id: 6,
    name: 'BassBoost Wireless Earbuds',
    description:
      'True wireless earbuds with deep bass, transparent hearing mode, and IPX5 water resistance. Includes a charging case with 24h total battery.',
    price: 89.99,
    category: 'Headphones',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    stock: 60,
    rating: 4.2,
    reviews: 187,
    featured: false,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-07-22T11:00:00Z',
  },
  {
    id: 7,
    name: 'MechaType RGB Keyboard',
    description:
      'Full-size mechanical keyboard with Cherry MX Red switches, per-key RGB lighting, and a sturdy aluminum frame. Great for gaming and typing.',
    price: 129.99,
    category: 'Keyboards',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    stock: 33,
    rating: 4.6,
    reviews: 214,
    featured: true,
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-08-01T13:00:00Z',
  },
  {
    id: 8,
    name: 'SlimKey Wireless Keyboard',
    description:
      'Ultra-thin Bluetooth keyboard compatible with Windows, Mac, and Linux. Multi-device pairing lets you switch between 3 devices instantly.',
    price: 59.99,
    category: 'Keyboards',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop',
    stock: 50,
    rating: 4.1,
    reviews: 99,
    featured: false,
    createdAt: '2026-04-10T14:00:00Z',
    updatedAt: '2026-06-30T10:00:00Z',
  },
  {
    id: 9,
    name: 'ViewMax 27" 4K Monitor',
    description:
      '27-inch 4K UHD IPS monitor with 144Hz refresh rate, HDR600 support, and USB-C connectivity. Perfect for design work and gaming.',
    price: 499.99,
    category: 'Monitors',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    stock: 15,
    rating: 4.7,
    reviews: 176,
    featured: true,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 10,
    name: 'CurvedView 32" Gaming Monitor',
    description:
      '32-inch curved VA panel with 240Hz refresh rate, 1ms response time, and FreeSync Premium Pro. Built for competitive gaming.',
    price: 379.99,
    category: 'Monitors',
    image: 'https://images.unsplash.com/photo-1593640408182-31c228af45b7?w=400&h=300&fit=crop',
    stock: 9,
    rating: 4.5,
    reviews: 143,
    featured: false,
    createdAt: '2026-05-10T11:00:00Z',
    updatedAt: '2026-07-25T15:00:00Z',
  },
  {
    id: 11,
    name: 'ErgoDesk USB Hub',
    description:
      '7-in-1 USB-C hub with 4K HDMI, 3x USB-A 3.0, SD card reader, and 100W pass-through charging. A must-have desk accessory.',
    price: 49.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop',
    stock: 75,
    rating: 4.4,
    reviews: 302,
    featured: false,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z',
  },
  {
    id: 12,
    name: 'PrecisionClick Pro Mouse',
    description:
      'Wireless ergonomic mouse with 16000 DPI, 8 programmable buttons, and 70-hour battery life. Designed to reduce wrist strain.',
    price: 79.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    stock: 44,
    rating: 4.5,
    reviews: 265,
    featured: true,
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-08-28T11:00:00Z',
  },
];

// All unique categories — used for filter buttons on the Products page
export const categories = [
  'All',
  'Laptops',
  'Smartphones',
  'Headphones',
  'Keyboards',
  'Monitors',
  'Accessories',
];
