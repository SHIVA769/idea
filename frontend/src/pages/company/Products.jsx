import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Tag,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { Tabs } from '../../components/common/Tabs';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const Products = () => {
  const { activeStore } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('list');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Form State (6 Tabs)
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    richDescription: '',
    price: 0,
    salePrice: 0,
    costPrice: 0,
    taxId: '',
    trackInventory: true,
    stockQuantity: 50,
    lowStockThreshold: 5,
    hasVariants: false,
    variants: [],
    thumbnail: '',
    images: [],
    seoTitle: '',
    seoDescription: '',
    customFields: [{ name: 'Material', value: 'Solid Oak & Linen' }],
    status: 'active',
  });

  const fetchData = async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [prodRes, catRes, taxRes] = await Promise.all([
        api.get('/company/products', { params: { storeId: activeStore._id, search, categoryId: selectedCategory } }),
        api.get('/company/categories', { params: { storeId: activeStore._id } }),
        api.get('/company/tax', { params: { storeId: activeStore._id } }),
      ]);
      if (prodRes.data?.success) setProducts(prodRes.data.data.products || prodRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data.categories || catRes.data.data);
      if (taxRes.data?.success) setTaxes(taxRes.data.data.taxes || taxRes.data.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, search, selectedCategory]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!activeStore?._id) {
      toast.error('Please select or create an active store before saving products.');
      return;
    }
    try {
      const payload = {
        ...productForm,
        storeId: activeStore._id,
        categoryId: productForm.categoryId || null,
        taxId: productForm.taxId || null,
      };
      if (editingProduct) {
        await api.put(`/company/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/company/products', payload);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories.length > 0 ? categories[0]._id : '',
      description: '',
      richDescription: '',
      price: 99,
      salePrice: 0,
      costPrice: 50,
      taxId: '',
      trackInventory: true,
      stockQuantity: 100,
      lowStockThreshold: 10,
      hasVariants: false,
      variants: [],
      thumbnail: '',
      images: [],
      seoTitle: '',
      seoDescription: '',
      customFields: [{ name: 'Warranty', value: '1 Year Manufacturer' }],
      status: 'active',
    });
    setActiveFormTab('basic');
    setIsProductModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku || '',
      categoryId: p.categoryId?._id || p.categoryId || '',
      description: p.description || '',
      richDescription: p.richDescription || p.description || '',
      price: p.price,
      salePrice: p.salePrice || 0,
      costPrice: p.costPrice || 0,
      taxId: p.taxId?._id || p.taxId || '',
      trackInventory: p.trackInventory ?? true,
      stockQuantity: p.stockQuantity ?? 10,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      hasVariants: p.hasVariants || false,
      variants: p.variants || [],
      thumbnail: p.thumbnail || '',
      images: p.images || [],
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      customFields: p.customFields || [],
      status: p.status || 'active',
    });
    setActiveFormTab('basic');
    setIsProductModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      try {
        await api.delete(`/company/products/${id}`);
        fetchData();
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const formTabs = [
    { id: 'basic', label: '1. Basic Info' },
    { id: 'pricing', label: '2. Pricing & Taxes' },
    { id: 'inventory', label: '3. Inventory & Variants' },
    { id: 'media', label: '4. Gallery Media' },
    { id: 'seo', label: '5. SEO Meta' },
    { id: 'specs', label: '6. Custom Specs' },
  ];

  const columns = [
    {
      header: 'Product',
      render: (p) => (
        <div className="flex items-center space-x-3">
          <img
            src={p.thumbnail || 'https://via.placeholder.com/80'}
            alt={p.name}
            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
          />
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
            <span className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      className: 'hidden md:table-cell',
      render: (p) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {p.categoryId?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      header: 'Price',
      render: (p) => (
        <div>
          <span className="font-bold font-mono text-slate-900 dark:text-white">${p.price}</span>
          {p.salePrice > 0 && (
            <span className="text-[10px] text-emerald-600 font-mono block">Sale: ${p.salePrice}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      className: 'hidden sm:table-cell',
      render: (p) => (
        <span className={`text-xs font-mono font-bold ${p.stockQuantity <= (p.lowStockThreshold || 5) ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
          {p.stockQuantity} in stock
        </span>
      ),
    },
    {
      header: 'Status',
      className: 'hidden lg:table-cell',
      render: (p) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {p.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end space-x-1">
          <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-600 hover:text-slate-900">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(p._id)} className="p-1.5 text-rose-600 hover:text-rose-900">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-xs text-slate-500">Manage merchandise, variants, multi-image galleries & price tiers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        showViewToggle={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterComponents={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        }
        renderGridItem={(p) => (
          <div key={p._id} className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-2xs group">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-white/90 text-slate-900 font-mono shadow-xs">
                ${p.price}
              </span>
            </div>
            <div className="p-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.stockQuantity} in stock</p>
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <button onClick={() => openEditModal(p)} className="text-xs font-semibold text-emerald-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(p._id)} className="text-xs text-rose-500 hover:text-rose-700">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {/* 6-Tab Product Create / Edit Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-left">
          <Tabs tabs={formTabs} activeTab={activeFormTab} onChange={setActiveFormTab} variant="pills" />

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
            {/* Tab 1: Basic Info */}
            {activeFormTab === 'basic' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ergonomic Velvet Armchair"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief 1-liner summary for listings"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description (Rich Text)</label>
                  <RichTextEditor
                    value={productForm.richDescription}
                    onChange={(val) => setProductForm({ ...productForm, richDescription: val })}
                    rows={6}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Pricing & Taxes */}
            {activeFormTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Regular Price ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sale Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.costPrice}
                      onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tax Rule</label>
                  <select
                    value={productForm.taxId}
                    onChange={(e) => setProductForm({ ...productForm, taxId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="">No Tax Applied</option>
                    {taxes.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.type === 'percentage' ? `${t.rate}%` : `$${t.rate}`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tab 3: Inventory & Variants */}
            {activeFormTab === 'inventory' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={productForm.lowStockThreshold}
                      onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                </div>

                <label className="flex items-center space-x-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={productForm.hasVariants}
                    onChange={(e) => setProductForm({ ...productForm, hasVariants: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>This product has multiple options (e.g. Size, Color)</span>
                </label>
              </div>
            )}

            {/* Tab 4: Media Gallery */}
            {activeFormTab === 'media' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Main Cover Thumbnail URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={productForm.thumbnail}
                    onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* Tab 5: SEO */}
            {activeFormTab === 'seo' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={productForm.seoTitle}
                    onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Meta Description</label>
                  <textarea
                    rows={3}
                    value={productForm.seoDescription}
                    onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Tab 6: Custom Specifications */}
            {activeFormTab === 'specs' && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">Add technical specifications and product characteristics:</p>
                {productForm.customFields.map((field, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Dimensions)"
                      value={field.name || field.key || ''}
                      onChange={(e) => {
                        const copy = [...productForm.customFields];
                        copy[idx].name = e.target.value;
                        setProductForm({ ...productForm, customFields: copy });
                      }}
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 120 x 80 cm)"
                      value={field.value}
                      onChange={(e) => {
                        const copy = [...productForm.customFields];
                        copy[idx].value = e.target.value;
                        setProductForm({ ...productForm, customFields: copy });
                      }}
                      className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({
                          ...productForm,
                          customFields: productForm.customFields.filter((_, i) => i !== idx),
                        });
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProductForm({
                      ...productForm,
                      customFields: [...productForm.customFields, { name: '', value: '' }],
                    });
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200"
                >
                  + Add Specification
                </button>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                Save Product
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
