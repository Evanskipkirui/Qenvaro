// ============================================================
// ADMIN LAYOUT
// ============================================================

import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { isAdmin, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/" replace />;

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-q">Q</span>envaro Admin
        </div>
        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} aria-hidden="true" /> Dashboard
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <Package size={16} aria-hidden="true" /> Products
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList size={16} aria-hidden="true" /> Orders
          </NavLink>
          <NavLink to="/" className="admin-nav-link">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Store
          </NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
