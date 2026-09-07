// ============================================================
// RETURNS PAGE  —  Route: /returns
// ============================================================

import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Returns() {
  return (
    <div className="support-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>Returns</span>
      </nav>

      <div className="support-header">
        <h1 className="support-title">Returns &amp; Refunds</h1>
        <p className="support-subtitle">
          Not satisfied? We make returns simple and hassle-free.
        </p>
      </div>

      {/* Highlights */}
      <div className="policy-highlights">
        <div className="policy-highlight-card">
          <RotateCcw size={28} aria-hidden="true" />
          <h3>30-Day Returns</h3>
          <p>Return within 30 days of delivery</p>
        </div>
        <div className="policy-highlight-card">
          <Clock size={28} aria-hidden="true" />
          <h3>Fast Refunds</h3>
          <p>Processed within 5–7 business days</p>
        </div>
        <div className="policy-highlight-card">
          <CheckCircle size={28} aria-hidden="true" />
          <h3>Easy Process</h3>
          <p>Just contact us to get started</p>
        </div>
      </div>

      <div className="policy-content">

        <div className="policy-section">
          <h2>Return Eligibility</h2>
          <p>To be eligible for a return, your item must meet the following conditions:</p>
          <ul className="policy-list">
            <li>Returned within 30 days of the delivery date</li>
            <li>Unused and in the same condition you received it</li>
            <li>In the original packaging with all accessories included</li>
            <li>Accompanied by the original receipt or proof of purchase</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>How to Return an Item</h2>
          <ol className="policy-list policy-list-ordered">
            <li>Contact us at <strong>support@qenvaro.com</strong> with your order ID and reason for return</li>
            <li>Our team will review your request within 24 hours and send return instructions</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Drop it off at the designated courier point or arrange a pickup</li>
            <li>Once received and inspected, your refund will be processed</li>
          </ol>
        </div>

        <div className="policy-section">
          <h2>Refund Timeline</h2>
          <p>
            Once we receive and inspect your returned item, we will notify you by email.
            If approved, your refund will be processed within <strong>5–7 business days</strong>.
            The refund will be credited to your original payment method.
          </p>
        </div>

        <div className="policy-section">
          <h2>Items That Cannot Be Returned</h2>
          <div className="policy-non-returnable">
            <XCircle size={18} aria-hidden="true" className="non-returnable-icon" />
            <div>
              <p>The following items are not eligible for return:</p>
              <ul className="policy-list">
                <li>Products that have been used or damaged after delivery</li>
                <li>Items returned without original packaging</li>
                <li>Products with broken or missing serial numbers</li>
                <li>Software licenses that have been activated</li>
                <li>Items purchased during a clearance sale</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2>Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective product, please contact us within
            <strong> 48 hours</strong> of delivery with photos of the damage.
            We will arrange a replacement or full refund at no extra cost to you.
          </p>
        </div>

      </div>

      <div className="support-cta">
        <p>Ready to start a return?</p>
        <Link to="/contact" className="btn btn-primary">Contact Us</Link>
      </div>
    </div>
  );
}
