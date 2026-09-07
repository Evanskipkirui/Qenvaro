// ============================================================
// ADMIN PRODUCTS PAGE  —  Route: /admin/products
// ============================================================

import { useState } from 'react';
import { CheckCircle, X, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { useProducts } from '../../context/ProductContext';

type ProductFormData = Omit<Product, 'id' | 'rating' | 'reviews' | 'featured' | 'createdAt' | 'updatedAt'>;

interface ProductFormErrors {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
}

const emptyForm: ProductFormData = {
  name: '', description: '', price: 0, category: '', image: '', stock: 0,
};

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();

  const [showForm, setShowForm]               = useState(false);
  const [editingProduct, setEditingProduct]   = useState<Product | null>(null);
  const [form, setForm]                       = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors]           = useState<ProductFormErrors>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [flashMessage, setFlashMessage]       = useState<string | null>(null);

  function openAddForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    });
    setFormErrors({});
    setShowForm(true);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
    if (formErrors[name as keyof ProductFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate(): boolean {
    const errs: ProductFormErrors = {};
    if (!form.name.trim())        errs.name        = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.price <= 0)          errs.price       = 'Price must be greater than 0';
    if (!form.category.trim())    errs.category    = 'Category is required';
    if (form.stock < 0)           errs.stock       = 'Stock cannot be negative';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
        setFlashMessage(`"${form.name}" updated successfully.`);
      } else {
        await addProduct(form);
        setFlashMessage(`"${form.name}" added successfully.`);
      }
      setShowForm(false);
      setTimeout(() => setFlashMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDeleteConfirm(id: number) {
    const product = products.find(p => p.id === id);
    try {
      await deleteProduct(id);
      setDeleteConfirmId(null);
      setFlashMessage(`"${product?.name}" deleted.`);
      setTimeout(() => setFlashMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Product Management</h1>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add Product
        </button>
      </div>

      {/* Flash message */}
      {flashMessage && (
        <div className="alert alert-success flash-message">
          <CheckCircle size={16} aria-hidden="true" /> {flashMessage}
          <button className="flash-close" onClick={() => setFlashMessage(null)} aria-label="Dismiss">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="admin-form" noValidate>

              <div className="form-group">
                <label htmlFor="adm-name">Product Name *</label>
                <input
                  id="adm-name" name="name" value={form.name}
                  onChange={handleFormChange} placeholder="e.g. MacBook Pro 14"
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adm-desc">Description *</label>
                <textarea
                  id="adm-desc" name="description" rows={3}
                  value={form.description} onChange={handleFormChange}
                  placeholder="Product description..."
                  className={formErrors.description ? 'input-error' : ''}
                />
                {formErrors.description && <span className="field-error">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="adm-price">Price (USD) *</label>
                  <input
                    id="adm-price" name="price" type="number" min="0" step="0.01"
                    value={form.price} onChange={handleFormChange}
                    className={formErrors.price ? 'input-error' : ''}
                  />
                  {formErrors.price && <span className="field-error">{formErrors.price}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="adm-stock">Stock *</label>
                  <input
                    id="adm-stock" name="stock" type="number" min="0"
                    value={form.stock} onChange={handleFormChange}
                    className={formErrors.stock ? 'input-error' : ''}
                  />
                  {formErrors.stock && <span className="field-error">{formErrors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adm-category">Category *</label>
                <select
                  id="adm-category" name="category"
                  value={form.category} onChange={handleFormChange}
                  className={formErrors.category ? 'input-error' : ''}
                >
                  <option value="">— Select category —</option>
                  {['Laptops','Smartphones','Headphones','Keyboards','Monitors','Accessories'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {formErrors.category && <span className="field-error">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adm-image">Image URL</label>
                <input
                  id="adm-image" name="image" type="url"
                  value={form.image} onChange={handleFormChange}
                  placeholder="https://... (optional)"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Product?</h2>
            <p>This action cannot be undone.</p>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeleteConfirm(deleteConfirmId)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-product-name">
                    <img
                      src={p.image || 'https://via.placeholder.com/40x40?text=?'}
                      alt={p.name}
                      className="table-product-img"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=?'; }}
                    />
                    {p.name}
                  </div>
                </td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  <span className={p.stock === 0 ? 'text-danger' : p.stock < 5 ? 'text-warning' : 'text-success'}>
                    {p.stock === 0 ? 'Out of stock' : p.stock < 5 ? `${p.stock} (low)` : p.stock}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEditForm(p)}>
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirmId(p.id)}>
                      <Trash2 size={14} aria-hidden="true" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
