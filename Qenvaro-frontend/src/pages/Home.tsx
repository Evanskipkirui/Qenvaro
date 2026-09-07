// ============================================================
// HOME PAGE
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Laptop, Smartphone, Headphones, Keyboard, Monitor, Cable,
  Truck, ShieldCheck, RotateCcw, Search,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { categories } from '../data/products';

// Category icons — increased to 40px for the new circular style
const categoryIcons: Record<string, React.ReactNode> = {
  Laptops:     <Laptop     size={40} aria-hidden="true" />,
  Smartphones: <Smartphone size={40} aria-hidden="true" />,
  Headphones:  <Headphones size={40} aria-hidden="true" />,
  Keyboards:   <Keyboard   size={40} aria-hidden="true" />,
  Monitors:    <Monitor    size={40} aria-hidden="true" />,
  Accessories: <Cable      size={40} aria-hidden="true" />,
};

// Soft background tint per category — keeps the purple identity but adds personality
const categoryColors: Record<string, string> = {
  Laptops:     '#eef2ff',
  Smartphones: '#f0fdf4',
  Headphones:  '#fdf4ff',
  Keyboards:   '#fff7ed',
  Monitors:    '#eff6ff',
  Accessories: '#fefce8',
};

const categoryIconColors: Record<string, string> = {
  Laptops:     '#4f46e5',
  Smartphones: '#16a34a',
  Headphones:  '#9333ea',
  Keyboards:   '#ea580c',
  Monitors:    '#2563eb',
  Accessories: '#ca8a04',
};

// Trust strip items
const trustItems = [
  { icon: <Truck size={22} aria-hidden="true" />,         label: 'Free Delivery',    desc: 'On orders over $50' },
  { icon: <ShieldCheck size={22} aria-hidden="true" />,   label: 'Secure Payments',  desc: '100% protected' },
  { icon: <RotateCcw size={22} aria-hidden="true" />,     label: 'Easy Returns',     desc: '30-day return policy' },
  { icon: <Headphones size={22} aria-hidden="true" />,    label: '24/7 Support',     desc: "We're here to help" },
];

export default function Home() {
  const { products } = useProducts();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const featuredProducts = products.filter((p) => p.featured);

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
      setHeroSearch('');
    }
  }

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            {/* Badge above headline */}
            <span className="hero-badge">ELECTRONICS MARKETPLACE</span>

            <h1 className="hero-title">
              Tech Worth <span className="highlight">Exploring</span>
            </h1>
            <p className="hero-subtitle">
              Shop the latest laptops, smartphones, headphones, and more — all in one place.
            </p>

            {/* Hero search bar — desktop only */}
            <form className="hero-search" onSubmit={handleHeroSearch}>
              <Search size={18} className="hero-search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="hero-search-input"
                aria-label="Search products"
              />
              <button type="submit" className="btn btn-primary hero-search-btn">
                Search
              </button>
            </form>

            {/* CTAs */}
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <Link to="/products?category=Laptops" className="btn btn-hero-outline btn-lg">
                Browse Categories
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">1,200+</span>
                <span className="hero-stat-label">Products</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">Fast</span>
                <span className="hero-stat-label">Delivery</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">Secure</span>
                <span className="hero-stat-label">Payments</span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=500&fit=crop"
              alt="Collection of modern tech gadgets including laptop, headphones and smartphone"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="trust-strip" aria-label="Our commitments">
        <div className="trust-strip-inner">
          {trustItems.map((item) => (
            <div key={item.label} className="trust-item">
              <span className="trust-icon">{item.icon}</span>
              <div className="trust-text">
                <span className="trust-label">{item.label}</span>
                <span className="trust-desc">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Page content wrapper (adds padding back) ── */}
      <div className="home-content">

      {/* ── CATEGORIES ── */}
      <section className="section categories-section">
        <div className="section-header">
          <div>
            <p className="section-overline">BROWSE</p>
            <h2>Shop by Category</h2>
          </div>
          <p className="section-sub">Browse our wide range of tech products</p>
        </div>
        <div className="categories-grid">
          {categories.filter((c) => c !== 'All').map((cat) => (
            <button
              key={cat}
              className="category-card"
              onClick={() => navigate(`/products?category=${cat}`)}
              aria-label={`Browse ${cat}`}
              style={{
                '--cat-bg': categoryColors[cat] || 'var(--primary-light)',
                '--cat-color': categoryIconColors[cat] || 'var(--primary)',
              } as React.CSSProperties}
            >
              <span className="category-circle">
                <span className="category-icon" style={{ color: categoryIconColors[cat] }}>
                  {categoryIcons[cat]}
                </span>
              </span>
              <span className="category-name">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section featured-section">
        <div className="section-header">
          <div>
            <p className="section-overline">HAND-PICKED FOR YOU</p>
            <h2>Featured Products</h2>
          </div>
          <Link to="/products" className="see-all-link">See all products →</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="promo-banner" aria-label="Special offer">
        <div className="promo-banner-inner">
          <div className="promo-text">
            <span className="promo-overline">SPECIAL OFFER</span>
            <h2 className="promo-title">Up to 30% off selected items</h2>
            <p className="promo-subtitle">Limited time deals on top-rated electronics. Don't miss out.</p>
          </div>
          <Link to="/products" className="btn btn-white btn-lg promo-btn">
            View Deals →
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to upgrade your setup?</h2>
          <p>Explore hundreds of products with fast delivery and easy returns.</p>
          <Link to="/products" className="btn btn-white btn-lg">
            Browse All Products
          </Link>
        </div>
      </section>

      </div>{/* end home-content */}
    </div>
  );
}
