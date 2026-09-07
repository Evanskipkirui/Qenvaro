// ============================================================
// ADD PRODUCT PAGE  —  Route: /products/new
// ============================================================
// WHAT IS THIS?
//   The page where a user fills out a form to create a new product.
//
// HOW DOES IT WORK?
//   1. The user fills in the ProductForm.
//   2. ProductForm validates the input.
//   3. If valid, ProductForm calls onSubmit with the values.
//   4. This page calls addProduct() from ProductContext,
//      which adds the product to the shared list.
//   5. The user is redirected to /products to see the new product.
//
// KEY CONCEPTS:
//   - useProducts() — gets addProduct from ProductContext
//   - useNavigate() — programmatically redirects after saving
//   - Props: onSubmit and onCancel are passed DOWN to ProductForm
// ============================================================

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import ProductForm, { ProductFormValues } from '../components/ProductForm';

export default function AddProduct() {
  const { addProduct } = useProducts();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // If not an admin, redirect away immediately — customers cannot add products
  if (!isAdmin) return <Navigate to="/products" replace />;

  // Tracks whether the form is in the process of "saving"
  // (in this mock version it's instant, but this prepares for real API calls)
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    try {
      await addProduct(values);
      navigate('/products', {
        state: { message: `"${values.name}" was added successfully!` },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add product');
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/products');
  }

  return (
    <div className="form-page">
      {/* Page header */}
      <div className="form-page-header">
        <button className="btn btn-outline btn-sm" onClick={handleCancel}>
          ← Back to Products
        </button>
        <h1 className="form-page-title">Add New Product</h1>
        <p className="form-page-subtitle">
          Fill in the details below to add a product to the Qenvaro catalogue.
        </p>
      </div>

      {/* The form card */}
      <div className="form-card">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Add Product"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
