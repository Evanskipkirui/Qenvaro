// ============================================================
// CHECKOUT PAGE
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../services/orderService';
import { CheckoutForm } from '../types';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
  });

  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Update a single field in the form
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name as keyof CheckoutForm]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  // Client-side validation before submitting
  function validate(): boolean {
    const newErrors: Partial<CheckoutForm> = {};
    if (!form.fullName.trim())  newErrors.fullName = 'Full name is required';
    if (!form.email.trim())     newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim())     newErrors.phone = 'Phone number is required';
    if (!form.address.trim())   newErrors.address = 'Delivery address is required';
    if (!form.city.trim())      newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true if no errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Must be logged in to place an order
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    setOrderError(null);
    try {
      await placeOrder(form, items, user.id);
      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      // Show the actual error message to the user
      setOrderError(
        err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      );
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="success-screen">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for shopping with Qenvaro. Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Delivery form */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Delivery Information</h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName" name="fullName" type="text"
              value={form.fullName} onChange={handleChange}
              className={errors.fullName ? 'input-error' : ''}
              placeholder="John Doe"
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="john@example.com"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              className={errors.phone ? 'input-error' : ''}
              placeholder="+254 700 000000"
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <input
              id="address" name="address" type="text"
              value={form.address} onChange={handleChange}
              className={errors.address ? 'input-error' : ''}
              placeholder="123 Main Street"
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city" name="city" type="text"
              value={form.city} onChange={handleChange}
              className={errors.city ? 'input-error' : ''}
              placeholder="Nairobi"
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          {orderError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={16} aria-hidden="true" /> {orderError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || items.length === 0}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        {/* Order summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="summary-row">
              <span>{product.name} × {quantity}</span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <p className="checkout-note">
            <CreditCard size={14} aria-hidden="true" /> Payment integration will be added when the backend is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
