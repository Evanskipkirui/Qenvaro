// ============================================================
// CART CONTEXT
// ============================================================
// React Context lets us share data across the whole app without
// passing it down manually through every component (called "prop drilling").
//
// Think of it as a global store specifically for the shopping cart.
// Any component can read the cart or update it by using the
// useCart() hook we export at the bottom.
// ============================================================

import React, { createContext, useContext, useReducer } from 'react';
import { CartItem, Product } from '../types';

// --- State shape ---
interface CartState {
  items: CartItem[];
}

// --- All the actions that can change the cart ---
type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'INCREASE_QTY'; productId: number }
  | { type: 'DECREASE_QTY'; productId: number }
  | { type: 'CLEAR_CART' };

// --- The reducer: a pure function that takes the current state
//     and an action, and returns the NEW state. ---
// (Pure = no side effects, same input always gives same output)
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // If the product is already in the cart, increase its quantity
      const existing = state.items.find(
        (item) => item.product.id === action.product.id
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      // Otherwise add it as a new cart item with quantity 1
      return {
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) => item.product.id !== action.productId
        ),
      };

    case 'INCREASE_QTY':
      return {
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case 'DECREASE_QTY':
      return {
        items: state.items
          .map((item) =>
            item.product.id === action.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          // Remove the item if quantity drops to 0
          .filter((item) => item.quantity > 0),
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// --- Context type: what data & functions will be available ---
interface CartContextType {
  items: CartItem[];
  totalItems: number;      // total count (sum of all quantities)
  totalPrice: number;      // total cost
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increaseQty: (productId: number) => void;
  decreaseQty: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// --- Provider component: wraps the whole app and provides cart state ---
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items: state.items,
    totalItems,
    totalPrice,
    addItem: (product) => dispatch({ type: 'ADD_ITEM', product }),
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    increaseQty: (productId) => dispatch({ type: 'INCREASE_QTY', productId }),
    decreaseQty: (productId) => dispatch({ type: 'DECREASE_QTY', productId }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// --- Custom hook: the clean way to consume the cart anywhere in the app ---
// Usage: const { items, addItem } = useCart();
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
