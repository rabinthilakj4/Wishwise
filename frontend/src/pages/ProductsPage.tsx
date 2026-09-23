import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const selectedCategoryObj = categories.find(c => c.slug === category || c.id === category);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res: any = await productService.getProducts({
        search: search || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        brand: brand || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    productService.getCategories().then((res: any) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: any = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (subcategory) params.subcategory = subcategory;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSubcategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Product Catalogue</h1>
          <p className="text-xs text-gray-500">20 Major Non-Food Categories with Verified Manufacturer Pricing.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value });
            }}
            className="w-full sm:w-auto px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Most Wishlisted</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills Row */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setCategory('');
              setSubcategory('');
              setSearchParams({ ...Object.fromEntries(searchParams), category: '', subcategory: '' });
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !category ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = category === cat.slug || category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.slug);
                  setSubcategory('');
                  setSearchParams({ ...Object.fromEntries(searchParams), category: cat.slug, subcategory: '' });
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isSelected ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <aside className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-pink-600" /> Filters
            </h3>
            <button onClick={handleReset} className="text-[11px] font-semibold text-gray-500 hover:text-pink-600 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="MacBook, Nike, Sony..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Select if available */}
            {selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
                >
                  <option value="">All Subcategories</option>
                  {selectedCategoryObj.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                placeholder="Apple, Sony, Nike..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow transition"
            >
              Apply Filters
            </button>

          </form>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
              <p className="text-base font-bold text-gray-800">No products match your selected filters.</p>
              <p className="text-xs text-gray-500">Try broadening your search keywords or resetting price limits.</p>
              <button onClick={handleReset} className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-full shadow">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
};
