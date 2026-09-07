// ============================================================
// CART PAGE
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, totalPrice, removeItem, increaseQty, decreaseQty, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    if (!isLoggedIn) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={64} aria-hidden="true" />}
        title="Your cart is empty"
        message="Looks like you haven't added anything yet."
        actionLabel="Shop Now"
        onAction={() => navigate('/products')}
      />
    );
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              <img src={product.image} alt={product.name} className="cart-item-image" />

              <div className="cart-item-info">
                <h3 className="cart-item-name">
                  <Link to={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="cart-item-category">{product.category}</p>
                <p className="cart-item-price">${product.price.toFixed(2)} each</p>
              </div>

              {/* Quantity controls */}
              <div className="cart-item-qty">
                <button
                  className="qty-btn"
                  onClick={() => decreaseQty(product.id)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => increaseQty(product.id)}
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              {/* Subtotal for this line */}
              <p className="cart-item-subtotal">
                ${(product.price * quantity).toFixed(2)}
              </p>

              {/* Remove button */}
              <button
                className="cart-item-remove"
                onClick={() => removeItem(product.id)}
                aria-label={`Remove ${product.name}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ))}

          <button className="btn btn-outline btn-sm clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        {/* Order summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-rows">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="summary-row">
                <span>{product.name} × {quantity}</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button className="btn btn-primary btn-lg summary-checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>

          <Link to="/products" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
