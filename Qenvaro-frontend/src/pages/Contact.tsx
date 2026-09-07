// ============================================================
// CONTACT PAGE  —  Route: /contact
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim())    newErrors.name    = 'Name is required';
    if (!form.email.trim())   newErrors.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.subject.trim()) newErrors.subject = 'Please select a subject';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // In a real app this would send to a backend endpoint
    // For now we just show a success message
    setSubmitted(true);
  }

  return (
    <div className="support-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span> / </span>
        <span>Contact Us</span>
      </nav>

      <div className="support-header">
        <h1 className="support-title">Contact Us</h1>
        <p className="support-subtitle">
          We'd love to hear from you. Send us a message and we'll respond within 24 hours.
        </p>
      </div>

      <div className="contact-layout">

        {/* Contact info */}
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <div className="contact-item">
            <span className="contact-icon"><Mail size={20} aria-hidden="true" /></span>
            <div>
              <strong>Email</strong>
              <p>support@qenvaro.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><Phone size={20} aria-hidden="true" /></span>
            <div>
              <strong>Phone</strong>
              <p>+254 700 000 000</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><MapPin size={20} aria-hidden="true" /></span>
            <div>
              <strong>Address</strong>
              <p>Westlands, Nairobi, Kenya</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><Clock size={20} aria-hidden="true" /></span>
            <div>
              <strong>Business Hours</strong>
              <p>Monday – Friday: 8:00 AM – 6:00 PM EAT</p>
              <p>Saturday: 9:00 AM – 3:00 PM EAT</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="contact-form-wrapper">
          {submitted ? (
            <div className="contact-success">
              <div className="success-icon">✓</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button
                className="btn btn-outline"
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <h2>Send a Message</h2>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="john@example.com"
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject" name="subject"
                  value={form.subject} onChange={handleChange}
                  className={errors.subject ? 'input-error' : ''}
                >
                  <option value="">— Select a subject —</option>
                  <option value="order">Order Issue</option>
                  <option value="delivery">Delivery Question</option>
                  <option value="return">Return / Refund</option>
                  <option value="product">Product Inquiry</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message" name="message" rows={5}
                  value={form.message} onChange={handleChange}
                  placeholder="Describe your issue or question..."
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
