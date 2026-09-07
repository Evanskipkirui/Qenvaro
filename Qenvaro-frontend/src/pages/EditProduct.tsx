// ============================================================
// EDIT PRODUCT PAGE  —  Route: /products/:id/edit
// ============================================================
// WHAT IS THIS?
//   The page where a user edits an existing product.
//
// HOW DOES IT WORK?
//   1. useParams() reads the :id from the URL  (e.g. /products/3/edit → id = "3")
//   2. getProductById(id) finds that product in the context.
//   3. The ProductForm is pre-filled with the product's current data.
//   4. When the user saves, updateProduct() in ProductContext is called.
//   5. The user is redirected to the product's detail page.
//
// KEY CONCEPTS:
//   - useParams() — reads URL parameters like :id
//   - useProducts() — gets getProductById and updateProduct
//   - useNavigate() — redirects after saving
//   - The same ProductForm component is reused here (DRY principle)
// ============================================================

import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import ProductForm, { ProductFormValues } from '../components/ProductForm';

export default function EditProduct() {
  // useParams reads the :id from the URL
  // e.g. if the URL is /products/7/edit  then  id === "7"
  const { id } = useParams<{ id: string }>();
  const { getProductById, updateProduct } = useProducts();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert the URL string "7" to a number 7 and find the product
  const product = getProductById(Number(id));

  // If not an admin, redirect away immediately
  if (!isAdmin) return <Navigate to="/products" replace />;

  // If no product was found with that id, show a not-found message
  if (!product) {
    return (
      <div className="error-container">
        <p className="error-message">
          <AlertTriangle size={16} aria-hidden="true" /> Product not found. It may have been deleted.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  async function handleSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    try {
      await updateProduct(product!.id, values);
      navigate(`/products/${product!.id}`, {
        state: { message: 'Product updated successfully!' },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update product');
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    // Go back to the detail page without saving
    navigate(`/products/${product!.id}`);
  }

  // Build the initial values from the existing product to pre-fill the form
  const initialData: ProductFormValues = {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    stock: product.stock,
  };

  return (
    <div className="form-page">
      {/* Page header */}
      <div className="form-page-header">
        <button className="btn btn-outline btn-sm" onClick={handleCancel}>
          ← Back to Product
        </button>
        <h1 className="form-page-title">Edit Product</h1>
        <p className="form-page-subtitle">
          Editing: <strong>{product.name}</strong>
        </p>
      </div>

      {/* The form card — same component as Add, but with initialData */}
      <div className="form-card">
        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
