// ============================================================
// NAVBAR COMPONENT
// ============================================================
// Layout: Logo (left) | Nav links (right) | Cart + Auth (far right)
// Search is in the hero on desktop; inside mobile menu on mobile.
// ============================================================

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ── Logo (left) ── */}
        <Link to="/" className="navbar-logo">
          <span className="logo-q">Q</span>envaro
        </Link>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen
            ? <X size={22} aria-hidden="true" />
            : <Menu size={22} aria-hidden="true" />
          }
        </button>

        {/* ── Navigation links + actions (right) ── */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>

          {/* Mobile search — only visible inside the open mobile menu */}
          <form className="navbar-mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search products"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <Search size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Nav links */}
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            end
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={() => setMenuOpen(false)}
          >
            Products
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </NavLink>
          )}

          {isLoggedIn && (
            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              My Orders
            </NavLink>
          )}

          {/* Divider between nav links and actions */}
          <span className="navbar-divider" aria-hidden="true" />

          {/* Auth actions */}
          {isLoggedIn ? (
            <>
              <span className="nav-user">Hi, {user?.fullName.split(' ')[0]}</span>
              <button className="nav-link btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
          )}

          {/* Cart icon */}
          <Link
            to="/cart"
            className="cart-icon"
            onClick={() => setMenuOpen(false)}
            aria-label={`Cart, ${totalItems} items`}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>

          {/* Shop Now CTA — primary action */}
          {!isLoggedIn && (
            <Link
              to="/register"
              className="btn btn-primary navbar-cta"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          )}
          {isLoggedIn && (
            <Link
              to="/products"
              className="btn btn-primary navbar-cta"
              onClick={() => setMenuOpen(false)}
            >
              Shop Now
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
