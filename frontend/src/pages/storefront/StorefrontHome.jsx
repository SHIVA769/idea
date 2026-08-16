import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Eye, Star, Sparkles, Filter } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

export const StorefrontHome = () => {
  const { slug } = useParams();
  const { storeData, themeConfig } = useOutletContext();
  const { addItem, setIsDrawerOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick View
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    if (slug) {
      const fetchCatalog = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/storefront/${slug}/products`, {
            params: { category: selectedCategory !== 'all' ? selectedCategory : undefined, search: searchQuery },
          });
          if (res.data?.success) {
            setProducts(res.data.data.products || []);
            setCategories(res.data.data.categories || []);
          }
        } catch (err) {
          console.error('Failed to load store catalog:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCatalog();
    }
  }, [slug, selectedCategory, searchQuery]);

  const handleQuickAdd = (p, e) => {
    e.stopPropagation();
    addItem({
      id: p._id,
      name: p.name,
      price: p.salePrice > 0 ? p.salePrice : p.price,
      image: p.thumbnail,
      quantity: 1,
    });
    setIsDrawerOpen(true);
  };

  const openQuickView = (p) => {
    setQuickViewProduct(p);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="space-y-10 text-left">
      {/* Theme-Tailored Hero Banner */}
      <div className={`relative rounded-3xl overflow-hidden shadow-lg ${themeConfig.heroGradient} p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8`}>
        <div className="max-w-xl space-y-4 z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{themeConfig.badgeText || 'Special Collection'}</span>
          </div>
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${themeConfig.fontHeading}`}>
            {storeData?.name || 'Welcome to Our Store'}
          </h1>
          <p className="text-sm sm:text-base opacity-90 leading-relaxed">
            {storeData?.welcomeMessage || 'Browse our catalog and enjoy instant, frictionless WhatsApp checkout.'}
          </p>
        </div>

        {themeConfig.heroImage && (
          <div className="w-full md:w-1/2 flex justify-center z-10">
            <img
              src={themeConfig.heroImage}
              alt="Hero Showcase"
              className="max-h-72 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </div>

      {/* Catalog Search & Category Filter Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products in store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs text-slate-900 dark:text-white"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {products.length} products
          </span>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c.slug || c._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === (c.slug || c._id)
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-2" />
          <p className="text-xs">Loading store catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            return (
              <div
                key={product._id}
                onClick={() => openQuickView(product)}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${themeConfig.productCard} flex flex-col justify-between`}
              >
                <div>
                  {/* Thumbnail Image with Quick View Trigger */}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    <img
                      src={product.thumbnail || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge */}
                    {product.salePrice > 0 && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider shadow-sm">
                        Sale
                      </span>
                    )}

                    {/* Quick View Button overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {product.categoryId?.name || 'In Stock'}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Footer Price & Add Button */}
                <div className="p-4 pt-0 flex items-center justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      ${product.salePrice > 0 ? product.salePrice : product.price}
                    </span>
                    {product.salePrice > 0 && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-transform active:scale-95 shadow-2xs"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          product={quickViewProduct}
          storeWhatsAppPhone={storeData?.whatsappWidget?.phoneNumber}
        />
      )}
    </div>
  );
};
