// ============================================================
// SHIPPING POLICY PAGE  —  Route: /shipping
// ============================================================

import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, AlertTriangle } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="support-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>Shipping Policy</span>
      </nav>

      <div className="support-header">
        <h1 className="support-title">Shipping Policy</h1>
        <p className="support-subtitle">
          Everything you need to know about how we deliver your orders.
        </p>
      </div>

      {/* Highlights */}
      <div className="policy-highlights">
        <div className="policy-highlight-card">
          <Truck size={28} aria-hidden="true" />
          <h3>Free Delivery</h3>
          <p>On all orders over $50</p>
        </div>
        <div className="policy-highlight-card">
          <Clock size={28} aria-hidden="true" />
          <h3>Standard: 3–5 Days</h3>
          <p>Business days after dispatch</p>
        </div>
        <div className="policy-highlight-card">
          <MapPin size={28} aria-hidden="true" />
          <h3>Nationwide</h3>
          <p>We deliver across Kenya</p>
        </div>
      </div>

      <div className="policy-content">

        <div className="policy-section">
          <h2>Delivery Options</h2>
          <div className="policy-table-wrapper">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Timeframe</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Delivery</td>
                  <td>3–5 business days</td>
                  <td>$5.00 (free over $50)</td>
                </tr>
                <tr>
                  <td>Express Delivery</td>
                  <td>1–2 business days</td>
                  <td>$12.00</td>
                </tr>
                <tr>
                  <td>Same-Day Delivery</td>
                  <td>Within 24 hours (Nairobi only)</td>
                  <td>$18.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="policy-section">
          <h2>Order Processing</h2>
          <p>
            Orders placed before 2:00 PM EAT (East Africa Time) on business days are processed the same day.
            Orders placed after 2:00 PM or on weekends are processed the next business day.
          </p>
          <p>
            You will receive an email confirmation once your order is placed, and another notification
            when your order has been dispatched.
          </p>
        </div>

        <div className="policy-section">
          <h2>Delivery Areas</h2>
          <p>
            We currently deliver to all major towns and cities across Kenya including Nairobi, Mombasa,
            Kisumu, Nakuru, Eldoret, Thika, and more. Remote areas may require additional delivery time.
          </p>
        </div>

        <div className="policy-section">
          <h2>Failed Delivery</h2>
          <p>
            If our courier is unable to deliver your order, they will leave a notification and attempt
            delivery again the next business day. After two failed attempts, your order will be held at
            the nearest pickup point for 5 days before being returned to us.
          </p>
        </div>

        <div className="policy-section">
          <div className="policy-note">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>
              Delivery times are estimates and may be affected by public holidays, weather conditions,
              or high-demand periods. For urgent orders, we recommend selecting Express Delivery.
            </p>
          </div>
        </div>

      </div>

      <div className="support-cta">
        <p>Have a question about your delivery?</p>
        <Link to="/contact" className="btn btn-primary">Contact Us</Link>
      </div>
    </div>
  );
}
