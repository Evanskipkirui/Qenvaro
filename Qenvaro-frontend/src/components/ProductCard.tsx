// ============================================================
// PRODUCT CARD COMPONENT
// ============================================================
// Badges added:
//   "Featured" — when product.featured is true
//   "Low Stock" — when stock > 0 and stock < 5
//   "Out of Stock" — existing badge, unchanged
// All existing functionality preserved.
// ============================================================

import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onDeleteClick?: (id: number) => void;
}

export default function ProductCard({ product, onDeleteClick }: ProductCardProps) {
  const { isAdmin } = useAuth();
  const { addItem, items } = useCart();

  const cartItem = items.find((i) => i.product.id === product.id);
  const inCart   = cartItem !== undefined;

  function handleAddToCart() {
    if (product.stock > 0) {
      addItem(product);
    }
  }

  return (
    <div className="product-card">

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="product-card-image-link">
        <img
          src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />

        {/* Out of stock badge — existing */}
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}

        {/* Featured badge — new */}
        {product.featured && product.stock > 0 && (
          <span className="product-badge badge-featured">Featured</span>
        )}

        {/* Low stock badge — new */}
        {product.stock > 0 && product.stock < 5 && (
          <span className="product-badge badge-low-stock">Low Stock</span>
        )}
      </Link>

      {/* Card Body */}
      <div className="product-card-body">
        <span className="product-category-tag">{product.category}</span>

        <h3 className="product-card-name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {product.reviews > 0 && (
          <div className="product-rating">
            <span className="stars">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </span>
            <span className="rating-count">({product.reviews})</span>
          </div>
        )}

        <p className="product-card-price">${product.price.toFixed(2)}</p>

        <p className={`stock-status ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : 'in'}`}>
          {product.stock === 0
            ? 'Out of Stock'
            : product.stock < 5
            ? `Only ${product.stock} left`
            : `In Stock (${product.stock})`}
        </p>
      </div>

      {/* Card Actions */}
      <div className="product-card-actions">

        {/* View Details — always shown */}
        <Link to={`/products/${product.id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>

        {/* Customer: Add to Cart */}
        {!isAdmin && (
          <button
            className={`btn btn-sm ${inCart ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.stock === 0 ? (
              'Unavailable'
            ) : inCart ? (
              <><Check size={14} aria-hidden="true" /> In Cart</>
            ) : (
              <><ShoppingCart size={14} aria-hidden="true" /> Add to Cart</>
            )}
          </button>
        )}

        {/* Admin: Edit & Delete */}
        {isAdmin && (
          <>
            <Link
              to={`/products/${product.id}/edit`}
              className="btn btn-sm btn-secondary"
            >
              <Pencil size={14} aria-hidden="true" /> Edit
            </Link>
            {onDeleteClick && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDeleteClick(product.id)}
                aria-label={`Delete ${product.name}`}
              >
                <Trash2 size={14} aria-hidden="true" /> Delete
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
}
