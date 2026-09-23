import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, Tag, RefreshCw } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, Category } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatusBadge } from '../../components/common/Badge';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pRes, cRes]: any[] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        productService.getCategories(),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [subcategoryId, setSubcategoryId] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [mrp, setMrp] = useState('');
  const [imageUrls, setImageUrls] = useState('');

  const selectedCategory = categories.find(c => c.id === categoryId);

  const openCreate = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setSubcategoryId('');
    setModelNumber('');
    setCurrentPrice('');
    setOriginalPrice('');
    setMrp('');
    setStockQuantity('10');
    setDescription('');
    setImageUrl('');
    setImageUrls('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategoryId(p.categoryId);
    setSubcategoryId(p.subcategoryId || '');
    setModelNumber(p.modelNumber || '');
    setCurrentPrice(String(p.currentPrice));
    setOriginalPrice(String(p.originalPrice));
    setMrp(p.mrp ? String(p.mrp) : String(p.originalPrice));
    setStockQuantity(String(p.stockQuantity));
    setDescription(p.description);
    setImageUrl(p.images?.[0]?.url || '');
    setImageUrls(p.images?.map(i => i.url).join('\n') || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedImageUrls = imageUrls.split('\n').map(s => s.trim()).filter(Boolean);
      if (imageUrl && !parsedImageUrls.includes(imageUrl)) {
        parsedImageUrls.unshift(imageUrl);
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name,
          brand,
          categoryId,
          subcategoryId: subcategoryId || undefined,
          modelNumber: modelNumber || undefined,
          currentPrice: parseFloat(currentPrice),
          originalPrice: parseFloat(originalPrice),
          mrp: mrp ? parseFloat(mrp) : parseFloat(originalPrice),
          stockQuantity: parseInt(stockQuantity, 10),
          description,
        });
      } else {
        await productService.createProduct({
          name,
          brand,
          categoryId,
          subcategoryId: subcategoryId || undefined,
          modelNumber: modelNumber || undefined,
          currentPrice: parseFloat(currentPrice),
          originalPrice: parseFloat(originalPrice),
          mrp: mrp ? parseFloat(mrp) : parseFloat(originalPrice),
          stockQuantity: parseInt(stockQuantity, 10),
          description,
          imageUrl: parsedImageUrls[0] || imageUrl,
          imageUrls: parsedImageUrls.length > 0 ? parsedImageUrls : undefined,
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to mark this product as REMOVED? Wishlist history will be preserved.')) {
      await productService.deleteProduct(id);
      fetchProducts();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Product & Inventory Management</h1>
            <p className="text-xs text-gray-400">Add products, update stock quantities, adjust prices, and manage catalogues.</p>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead>
              <tr className="border-b border-slate-700 text-gray-400 uppercase text-[10px]">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition">
                  <td className="py-3 px-4 font-mono text-gray-400">{p.sku}</td>
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                    <img src={p.images?.[0]?.url} alt={p.name} className="w-8 h-8 object-contain rounded bg-slate-900 p-1" />
                    {p.name}
                  </td>
                  <td className="py-3 px-4">{p.brand}</td>
                  <td className="py-3 px-4 font-bold text-white">₹{p.currentPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{p.stockQuantity}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.availabilityStatus} count={p.stockQuantity} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-white bg-slate-900 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-900 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Model Number</label>
                    <input
                      type="text"
                      placeholder="e.g. A3106"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        setSubcategoryId('');
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Subcategory</label>
                    <select
                      value={subcategoryId}
                      onChange={(e) => setSubcategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    >
                      <option value="">None / Main Category Only</option>
                      {selectedCategory?.subcategories?.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      required
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Gallery Image URLs (One URL per line)</label>
                  <textarea
                    rows={3}
                    placeholder="https://images.unsplash.com/photo-1..."
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none font-mono text-[11px]"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-rose-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold rounded-xl shadow">
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
