// ============================================================
// PRODUCT FORM COMPONENT
// ============================================================
// WHAT IS THIS?
//   A reusable form used by BOTH the Add Product page and the
//   Edit Product page. Instead of writing two separate forms
//   that look almost identical, we write one and pass data in
//   via props.
//
// HOW DOES IT WORK?
//   - When adding: initialData is undefined, so all fields start empty.
//   - When editing: initialData is the existing product, so fields
//     are pre-filled with the current values.
//   - When the user submits, onSubmit is called with the form values.
//     The parent page (AddProduct or EditProduct) decides what to do
//     with those values (call addProduct or updateProduct).
//
// KEY REACT CONCEPTS USED:
//   - Props: the parent passes in initialData and onSubmit
//   - State: each input field is a controlled input tracked by useState
//   - Events: onChange updates state, onSubmit validates then calls the prop
//   - Controlled inputs: React controls the value of every <input>,
//     so the state is always the single source of truth
// ============================================================

import { useState } from 'react';
import { categories } from '../data/products';

// The data the form collects — no id, rating, etc. (those are handled elsewhere)
export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

// The validation errors object — every field may or may not have an error string
interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
  category?: string;
  stock?: string;
}

interface ProductFormProps {
  // Pre-filled values when editing an existing product (undefined when adding)
  initialData?: ProductFormValues;
  // Called when the form is valid and submitted
  onSubmit: (values: ProductFormValues) => void;
  // Called when the user clicks Cancel
  onCancel: () => void;
  // Label for the submit button e.g. "Add Product" or "Save Changes"
  submitLabel: string;
  // Show a spinner on the submit button while saving
  isSubmitting?: boolean;
}

// A blank form — used as the starting state when adding a new product
const emptyValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  image: '',
  category: '',
  stock: 0,
};

export default function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false,
}: ProductFormProps) {

  // ── State ──────────────────────────────────────────────────
  // If initialData is provided (editing), use it. Otherwise start empty.
  const [values, setValues] = useState<ProductFormValues>(
    initialData ?? emptyValues
  );
  // errors holds one string per field if that field failed validation
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Event Handlers ─────────────────────────────────────────

  // Called whenever the user types in any input/textarea/select
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      // price and stock should be numbers, everything else stays a string
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
    // Clear the error for this field as the user types — gives immediate feedback
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  // Client-side validation — runs before submitting
  // Returns true if all fields are valid, false otherwise
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!values.name.trim())
      newErrors.name = 'Product name is required';

    if (!values.description.trim())
      newErrors.description = 'Description is required';
    else if (values.description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters';

    if (values.price <= 0)
      newErrors.price = 'Price must be greater than $0';

    if (!values.category)
      newErrors.category = 'Please select a category';

    if (values.stock < 0)
      newErrors.stock = 'Stock cannot be negative';

    setErrors(newErrors);

    // If newErrors has no keys, validation passed
    return Object.keys(newErrors).length === 0;
  }

  // Called when the form is submitted
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // stop the browser from reloading the page

    if (!validate()) return; // stop if any field is invalid

    onSubmit(values); // pass the validated values up to the parent page
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Product form">

      {/* Product Name */}
      <div className="form-group">
        <label htmlFor="name">Product Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          placeholder="e.g. ProBook Laptop 15"
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={handleChange}
          placeholder="Describe the product features and specs..."
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      {/* Price and Stock side by side */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Price (USD) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={handleChange}
            className={errors.price ? 'input-error' : ''}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock Quantity *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={values.stock}
            onChange={handleChange}
            className={errors.stock ? 'input-error' : ''}
          />
          {errors.stock && <span className="field-error">{errors.stock}</span>}
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={handleChange}
          className={errors.category ? 'input-error' : ''}
        >
          <option value="">— Select a category —</option>
          {/* Filter out "All" since it's only for filtering, not a real category */}
          {categories.filter((c) => c !== 'All').map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <span className="field-error">{errors.category}</span>}
      </div>

      {/* Image URL */}
      <div className="form-group">
        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          name="image"
          type="url"
          value={values.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg (optional)"
        />
        {/* Live preview of the image if a URL has been entered */}
        {values.image && (
          <img
            src={values.image}
            alt="Preview"
            className="image-preview"
            onError={(e) => {
              // If the URL is invalid, hide the broken image
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.display = 'block';
            }}
          />
        )}
        <span className="field-hint">Paste a direct image URL. Leave blank to use a placeholder.</span>
      </div>

      {/* Form action buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>

    </form>
  );
}
