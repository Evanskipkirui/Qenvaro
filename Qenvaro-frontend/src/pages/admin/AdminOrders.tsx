// ============================================================
// ADMIN ORDERS PAGE  —  Route: /admin/orders
// ============================================================
// Fetches ALL orders from the backend (admin sees everything).
// Admin can update order status via PUT /api/orders/:id/status
// ============================================================

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getAllOrders } from '../../services/orderService';
import { apiRequest } from '../../services/api';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const allStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      // Update local state so the UI reflects the change immediately
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  }

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Order Management</h1>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={16} aria-hidden="true" /> {error}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{selectedOrder.id}</h2>
            <p><strong>Date:</strong> {selectedOrder.date}</p>
            <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>

            {selectedOrder.items.length > 0 && (
              <>
                <h3 style={{ margin: '1rem 0 0.5rem' }}>Items</h3>
                <table className="admin-table">
                  <thead>
                    <tr><th>Product ID</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td>#{item.productId}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label><strong>Update Status</strong></label>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                className="sort-select"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Orders table */}
      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>No orders yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.date}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                      <select
                        className="status-select-inline"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                        aria-label={`Update status for order ${order.id}`}
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
