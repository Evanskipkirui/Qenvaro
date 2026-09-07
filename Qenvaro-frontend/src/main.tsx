// ============================================================
// MAIN.TSX — THE ENTRY POINT
// ============================================================
// WHAT IS THIS?
//   The very first file that runs. It mounts the React app
//   into the <div id="root"> that exists in index.html.
//
// THE PROVIDER TREE (read from inside out):
//   <App>             ← all the pages and routes
//   <CartProvider>    ← makes cart state available everywhere
//   <ProductProvider> ← makes product CRUD state available everywhere
//   <AuthProvider>    ← makes login state available everywhere
//   <BrowserRouter>   ← enables URL-based navigation
//
// WHY ARE PROVIDERS NESTED LIKE THIS?
//   Each Provider is like a wrapper that shares data with everything
//   inside it. By wrapping the whole app, every page and component
//   can access auth, products, and cart data without prop drilling.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider }    from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider }    from './context/CartContext';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
