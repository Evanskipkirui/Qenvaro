// ============================================================
// APP.TSX — THE ROUTER
// ============================================================
// WHAT IS THIS?
//   This file defines ALL pages and their URL paths.
//   React Router reads the current URL and renders the matching
//   component — no full page reload happens.
//
// HOW ROUTING WORKS:
//   <Routes>       → container for all route definitions
//   <Route>        → maps one URL pattern to one component
//   <Outlet />     → placeholder inside layouts where child routes render
//
// ROUTE STRUCTURE:
//   /                  → Home page
//   /products          → All products (READ + DELETE)
//   /products/new      → Add product form (CREATE)
//   /products/:id      → Single product details (READ)
//   /products/:id/edit → Edit product form (UPDATE)
//
// IMPORTANT — Route ordering:
//   /products/new MUST come BEFORE /products/:id
//   Otherwise React Router would treat "new" as an :id value.
//
// LAYOUTS:
//   MainLayout  — wraps all customer pages (has Navbar + Footer)
//   AdminLayout — wraps admin pages (has sidebar, requires admin login)
// ============================================================

import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout  from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer pages
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AddProduct    from './pages/AddProduct';
import EditProduct   from './pages/EditProduct';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import MyOrders      from './pages/MyOrders';
import FAQ           from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import Returns       from './pages/Returns';
import Contact       from './pages/Contact';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders    from './pages/admin/AdminOrders';

export default function App() {
  return (
    <Routes>

      {/* ── CUSTOMER ROUTES (wrapped in MainLayout = Navbar + Footer) ── */}
      <Route element={<MainLayout />}>
        <Route path="/"            element={<Home />} />
        <Route path="/products"    element={<Products />} />

        {/* ADD: /products/new — must come BEFORE /products/:id */}
        <Route path="/products/new"      element={<AddProduct />} />

        {/* READ (single): /products/5 */}
        <Route path="/products/:id"      element={<ProductDetail />} />

        {/* EDIT: /products/5/edit */}
        <Route path="/products/:id/edit" element={<EditProduct />} />

        <Route path="/cart"        element={<Cart />} />
        <Route path="/checkout"    element={<Checkout />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/orders"      element={<MyOrders />} />
        <Route path="/faq"         element={<FAQ />} />
        <Route path="/shipping"    element={<ShippingPolicy />} />
        <Route path="/returns"     element={<Returns />} />
        <Route path="/contact"     element={<Contact />} />
      </Route>

      {/* ── ADMIN ROUTES (wrapped in AdminLayout = sidebar, auth-gated) ── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index           element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders"   element={<AdminOrders />} />
      </Route>

    </Routes>
  );
}
