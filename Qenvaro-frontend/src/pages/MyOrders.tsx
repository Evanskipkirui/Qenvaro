// ============================================================
// MY ORDERS PAGE
// ============================================================
// Shows the logged-in customer's order history.
// Uses mock data for now — will call GET /api/orders when
// the backend is ready.
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, FileText } from 'lucide-react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Order } from '../types';
import { getMyOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export default function MyOrders() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      navigate('/login?redirect=/orders');
      return;
    }
    async function load() {
      try {
        const data = await getMyOrders(user!.id);
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLoggedIn, user, navigate]);

  if (loading) return <LoadingSpinner message="Loading your orders..." />;

  return (
    <div className="orders-page">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<FileText size={64} aria-hidden="true" />}
          title="No orders yet"
          message="You haven't placed any orders. Start shopping!"
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h3 className="order-id">{order.id}</h3>
                  <p className="order-date">Placed on {order.date}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.productId} className="order-item-row">
                    <span>{item.productName}</span>
                    <span>× {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <span className="order-total">Total: <strong>${order.total.toFixed(2)}</strong></span>
                <span className="order-address">
                  <MapPin size={13} aria-hidden="true" /> {order.deliveryAddress}, {order.city}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
