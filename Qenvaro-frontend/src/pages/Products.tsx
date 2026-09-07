// ============================================================
// PRODUCTS PAGE  —  Route: /products
// ============================================================
// WHAT IS THIS?
//   The main product listing page. Shows all products in a
//   responsive grid with search, category filter, and sort.
//
// CRUD OPERATIONS ON THIS PAGE:
//   READ   — displays all products
//   DELETE — each card has a Delete button with a confirmation
//
//   Add and Edit have their own dedicated pages
//   (/products/new and /products/:id/edit).
//
// HOW DOES STATE WORK HERE?
//   - products, deleteProduct come from ProductContext (global state)
//   - searchInput, activeCategory, sortBy are local state —
//     they only matter on this page so they live here with useState
//
// KEY CONCEPTS:
//   - useProducts() — reads from ProductContext
//   - useSearchParams() — reads ?search=laptop&category=Laptops from URL
//   - useLocation() — reads the flash message passed after Add/Edit
// ============================================================

import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, X, SearchX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/products';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'rating';

export default function Products() {
  const { products, deleteProduct } = useProducts();
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Read URL query params like ?search=laptop or ?category=Laptops
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch   = searchParams.get('search')   ?? '';
  const urlCategory = searchParams.get('category') ?? 'All';

  const [searchInput,    setSearchInput]    = useState(urlSearch);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy,         setSortBy]         = useState<SortOption>('default');

  // Delete confirmation — holds the id of the product the user clicked Delete on
  // null means no confirmation dialog is showing
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Flash message — shown after successfully adding or editing a product
  // It's passed through navigation state by AddProduct and EditProduct pages
  const [flashMessage, setFlashMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null
  );

  // Sync URL params → local filter state when the URL changes
  // e.g. clicking "View Laptops" on the Home page sets ?category=Laptops
  useEffect(() => {
    setActiveCategory(urlCategory);
    setSearchInput(urlSearch);
  }, [urlCategory, urlSearch]);

  // Auto-dismiss the flash message after 4 seconds
  useEffect(() => {
    if (!flashMessage) return;
    const timer = setTimeout(() => setFlashMessage(null), 4000);
    return () => clearTimeout(timer); // clean up if component unmounts early
  }, [flashMessage]);

  // ── Filtering + Sorting ──────────────────────────────────
  // This runs every render — derives the displayed list from full list + filters
  const displayedProducts = products
    .filter((p) => {
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      const term = searchInput.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':  return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc':   return a.name.localeCompare(b.name);
        case 'rating':     return b.rating - a.rating;
        default:           return 0; // keep original order
      }
    });

  // ── Handlers ────────────────────────────────────────────

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    // Also update the URL so browser back button works correctly
    const params: Record<string, string> = {};
    if (cat !== 'All')       params.category = cat;
    if (searchInput.trim()) params.search   = searchInput.trim();
    setSearchParams(params);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchInput.trim())       params.search   = searchInput.trim();
    if (activeCategory !== 'All') params.category = activeCategory;
    setSearchParams(params);
  }

  async function handleDeleteConfirm() {
    if (confirmDeleteId === null) return;
    try {
      await deleteProduct(confirmDeleteId);
      setFlashMessage('Product deleted successfully.');
    } catch (err) {
      setFlashMessage(err instanceof Error ? err.message : 'Failed to delete product');
    }
    setConfirmDeleteId(null);
  }

  function clearFilters() {
    setSearchInput('');
    setActiveCategory('All');
    setSearchParams({});
  }

  return (
    <div className="products-page">

      {/* Flash message — appears after Add, Edit, or Delete */}
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

      {/* Page header */}
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>
            {displayedProducts.length} product
            {displayedProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {/* "+ Add Product" button — only visible to admins */}
        {isAdmin && (
          <Link to="/products/new" className="btn btn-primary">
            + Add Product
          </Link>
        )}
      </div>

      {/* Search bar */}
      <form className="products-search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by name, description or category..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
          aria-label="Search products"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Category filters + Sort */}
      <div className="products-controls">
        <div className="category-filters" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          aria-label="Sort products"
        >
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId !== null && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmDeleteId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Delete confirmation"
        >
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this product?</h2>
            <p>This will remove the product from the list. This action cannot be undone.</p>
            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid or empty state */}
      {displayedProducts.length === 0 ? (
        <EmptyState
          icon={<SearchX size={64} aria-hidden="true" />}
          title="No products found"
          message="Try adjusting your search or category filter."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="products-grid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDeleteClick={(id) => setConfirmDeleteId(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
