import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-logo">
            <span className="logo-q">Q</span>envaro
          </h3>
          <p>Your one-stop shop for the latest tech gadgets and accessories.</p>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Laptops">Laptops</Link>
          <Link to="/products?category=Smartphones">Smartphones</Link>
          <Link to="/products?category=Accessories">Accessories</Link>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <Link to="/faq">FAQ</Link>
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Qenvaro. All rights reserved.</p>
      </div>
    </footer>
  );
}
