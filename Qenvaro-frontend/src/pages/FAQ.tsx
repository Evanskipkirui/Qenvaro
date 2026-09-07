// ============================================================
// FAQ PAGE  —  Route: /faq
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I place an order?',
    answer:
      'Browse our products, click "Add to Cart" on any item you want, then go to your cart and click "Proceed to Checkout". Fill in your delivery details and click "Place Order".',
  },
  {
    question: 'Do I need an account to shop?',
    answer:
      'You can browse products without an account, but you need to register and log in to place an order. Registration is free and only takes a minute.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We currently accept M-Pesa, bank transfer, and major debit/credit cards. Payment is processed securely at checkout.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Once you place an order, you can view its status at any time by going to "My Orders" in your account. Statuses include: Pending, Processing, Shipped, and Delivered.',
  },
  {
    question: 'Can I cancel an order?',
    answer:
      'You can request a cancellation while your order is still in "Pending" status. Once it moves to "Processing" or beyond, cancellation may not be possible. Contact us immediately at support@qenvaro.com.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Standard delivery takes 3–5 business days. Express delivery (1–2 business days) is available at checkout for an additional fee.',
  },
  {
    question: 'What do I do if I receive a damaged product?',
    answer:
      'If your product arrives damaged, take photos immediately and contact us within 48 hours at support@qenvaro.com. We will arrange a replacement or refund.',
  },
  {
    question: 'Are the products covered by warranty?',
    answer:
      'Yes. All products sold on Qenvaro come with the manufacturer\'s standard warranty. Warranty duration varies by product — check the product description for details.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="support-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>FAQ</span>
      </nav>

      <div className="support-header">
        <h1 className="support-title">Frequently Asked Questions</h1>
        <p className="support-subtitle">
          Find answers to the most common questions about shopping on Qenvaro.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => toggle(index)}
              aria-expanded={openIndex === index}
            >
              <span>{item.question}</span>
              {openIndex === index
                ? <ChevronUp size={20} aria-hidden="true" />
                : <ChevronDown size={20} aria-hidden="true" />
              }
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="support-cta">
        <p>Still have questions?</p>
        <Link to="/contact" className="btn btn-primary">Contact Us</Link>
      </div>
    </div>
  );
}
