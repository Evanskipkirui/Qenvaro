// ============================================================
// PRODUCT DETAIL PAGE  —  Route: /products/:id
// ============================================================

import { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle, X, XCircle, AlertTriangle,
  ShoppingCart, Check, Pencil, Trash2, SearchX
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProductById, deleteProduct } = useProducts();
  const { isAdmin } = useAuth();
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const flashFromNav = (location.state as { message?: string } | null)?.message;
  const [flashMessage, setFlashMessage] = useState<string | null>(flashFromNav ?? null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  const product = getProductById(Number(id));
  const cartItem = items.find((i) => i.product.id === product?.id);

  // Product not found
  if (!product) {
    return (
      <div className="error-container">
        <div className="empty-state">
          <span className="empty-state-icon">
            <SearchX size={64} aria-hidden="true" />
          </span>
          <h2 className="empty-state-title">Product Not Found</h2>
          <p className="empty-state-message">
            This product does not exist or may have been deleted.
          </p>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem(product!);
    }
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  }

  async function handleDelete() {
    try {
      await deleteProduct(product!.id);
      navigate('/products', {
        state: { message: `"${product!.name}" was deleted.` },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  }

  return (
    <div className="product-detail-page">

      {/* Flash message */}
      {flashMessage && (
        <div className="alert alert-success flash-message">
          <CheckCircle size={16} aria-hidden="true" /> {flashMessage}
          <button
            className="flash-close"
            onClick={() => setFlashMessage(null)}
            aria-label="Dismiss"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <Link to="/products">Products</Link>
        <span> / </span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-grid">

        {/* Product image */}
        <div className="product-detail-image-wrapper">
          <img
            src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.name}
            className="product-detail-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/500x400?text=No+Image';
            }}
          />
          {product.stock === 0 && (
            <div className="out-of-stock-overlay">Out of Stock</div>
          )}
        </div>

        {/* Product info */}
        <div className="product-detail-info">
          <span className="product-category-tag">{product.category}</span>
          <h1 className="product-detail-name">{product.name}</h1>

          {product.reviews > 0 && (
            <div className="product-rating">
              <span className="stars">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </span>
              <span className="rating-count">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          )}

          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-detail-description">{product.description}</p>

          {/* Stock status */}
          <p className={`stock-status ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : 'in'}`}>
            {product.stock === 0 ? (
              <><XCircle size={14} aria-hidden="true" /> Out of Stock</>
            ) : product.stock < 5 ? (
              <><AlertTriangle size={14} aria-hidden="true" /> Only {product.stock} left in stock</>
            ) : (
              <><CheckCircle size={14} aria-hidden="true" /> In Stock — {product.stock} available</>
            )}
          </p>

          {/* Metadata */}
          <div className="product-meta">
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Added:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
            <p><strong>Last updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}</p>
          </div>

          {/* Customer: Quantity selector */}
          {!isAdmin && product.stock > 0 && (
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(product.stock, Math.max(1, Number(e.target.value)))
                    )
                  }
                  className="qty-input"
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="product-detail-actions">
            <Link to="/products" className="btn btn-outline">
              ← Back to Products
            </Link>

            {/* Customer: Add to Cart */}
            {!isAdmin && (
              <>
                <button
                  className={`btn btn-lg ${addedMsg ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? (
                    'Out of Stock'
                  ) : addedMsg ? (
                    <><Check size={16} aria-hidden="true" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart size={16} aria-hidden="true" /> Add to Cart</>
                  )}
                </button>
                {cartItem && (
                  <Link to="/cart" className="btn btn-outline btn-lg">
                    View Cart ({cartItem.quantity})
                  </Link>
                )}
              </>
            )}

            {/* Admin: Edit and Delete */}
            {isAdmin && (
              <>
                <Link
                  to={`/products/${product.id}/edit`}
                  className="btn btn-primary btn-lg"
                >
                  <Pencil size={16} aria-hidden="true" /> Edit Product
                </Link>
                <button
                  className="btn btn-danger btn-lg"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} aria-hidden="true" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this product?</h2>
            <p>
              <strong>{product.name}</strong> will be permanently removed.
              This cannot be undone.
            </p>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
