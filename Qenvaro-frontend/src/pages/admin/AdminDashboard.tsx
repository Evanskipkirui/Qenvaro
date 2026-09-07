// ============================================================
// ADMIN DASHBOARD PAGE  —  Route: /admin
// ============================================================

import { useEffect, useState } from 'react';
import {
  Package, ClipboardList, DollarSign,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { getAllOrders } from '../../services/orderService';
import { Order } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { products } = useProducts();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const totalOrders   = orders.length;
  const totalRevenue  = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Total Products', value: totalProducts,                 icon: <Package      size={32} aria-hidden="true" />, color: 'stat-blue'   },
    { label: 'Total Orders',   value: totalOrders,                   icon: <ClipboardList size={32} aria-hidden="true" />, color: 'stat-green'  },
    { label: 'Revenue',        value: `$${totalRevenue.toFixed(2)}`, icon: <DollarSign   size={32} aria-hidden="true" />, color: 'stat-orange' },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={16} aria-hidden="true" /> Could not load orders: {error}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.color}`}>
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-info">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="admin-section">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No orders yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product stock overview */}
      <div className="admin-section">
        <h2>Product Stock Overview</h2>
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <span className="stat-icon"><CheckCircle size={32} aria-hidden="true" /></span>
            <div className="stat-info">
              <p className="stat-value">{products.filter(p => p.stock > 4).length}</p>
              <p className="stat-label">In Stock</p>
            </div>
          </div>
          <div className="stat-card stat-orange">
            <span className="stat-icon"><AlertTriangle size={32} aria-hidden="true" /></span>
            <div className="stat-info">
              <p className="stat-value">{products.filter(p => p.stock > 0 && p.stock < 5).length}</p>
              <p className="stat-label">Low Stock</p>
            </div>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-icon"><XCircle size={32} aria-hidden="true" /></span>
            <div className="stat-info">
              <p className="stat-value">{products.filter(p => p.stock === 0).length}</p>
              <p className="stat-label">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
