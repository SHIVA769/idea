import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Search, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { useCart } from '../../context/CartContext';
import { useStorefrontCatalog } from '../../layouts/StorefrontLayout';
import {
  StorefrontHero,
  StorefrontAdvertisements,
  StorefrontCategoryRow,
  StorefrontFeaturesBar,
  StorefrontPromoBanner,
  StorefrontTestimonials,
  WhatsAppProductCard,
} from './StorefrontSections';
import api from '../../api/axios';

export const StorefrontHome = () => {
  const { slug } = useParams();
  const { storeData, themeConfig } = useOutletContext();
  const { addToCart, setIsDrawerOpen } = useCart();
  const catalog = useStorefrontCatalog();

  const isWhatsAppStore = themeConfig.isWhatsAppStore;

  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('all');

  const searchQuery = isWhatsAppStore ? (catalog?.searchQuery ?? '') : localSearch;
  const setSearchQuery = isWhatsAppStore ? (catalog?.setSearchQuery ?? setLocalSearch) : setLocalSearch;
  const selectedCategory = isWhatsAppStore ? (catalog?.selectedCategory ?? 'all') : localCategory;
  const setSelectedCategory = isWhatsAppStore ? (catalog?.setSelectedCategory ?? setLocalCategory) : setLocalCategory;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    const fetchCatalog = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get(`/storefront/${slug}/products`, {
          params: {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
          },
        });
        if (isMounted && res.data?.success) {
          setProducts(res.data.data.products || []);
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load store catalog:', err);
      } finally {
        if (isMounted && !silent) setLoading(false);
      }
    };

    fetchCatalog();

    const interval = setInterval(() => fetchCatalog(true), 15000);

    const onFocus = () => fetchCatalog(true);
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [slug, selectedCategory, searchQuery]);

  const handleQuickAdd = (p, e) => {
    e.stopPropagation();
    addToCart({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      price: p.salePrice > 0 ? p.salePrice : p.price,
      salePrice: p.salePrice,
      thumbnail: p.thumbnail,
      coverImage: p.coverImage || p.thumbnail,
      stockQuantity: p.stockQuantity,
      taxId: p.taxId,
    }, 1, null);
    setIsDrawerOpen(true);
  };

  const openQuickView = (p) => {
    setQuickViewProduct(p);
    setIsQuickViewOpen(true);
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isWhatsAppStore) {
    const isFiltered = selectedCategory !== 'all' || searchQuery.trim().length > 0;
    const displayProducts = products;

    return (
      <div className="space-y-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <StorefrontHero storeData={storeData} themeConfig={themeConfig} onShopNow={scrollToProducts} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontAdvertisements advertisements={storeData?.advertisements} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontCategoryRow
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              scrollToProducts();
            }}
          />
        </div>

        <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isFiltered ? 'Products' : 'Trending Products'}
            </h2>
            <span className="text-xs text-slate-500">{products.length} items</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm font-semibold text-[#25D366] hover:text-[#128C7E] transition-colors"
            >
              View All Products
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#25D366] border-t-transparent mb-2" />
              <p className="text-xs">Loading products...</p>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 p-8">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-1">Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayProducts.map((product) => (
                <WhatsAppProductCard
                  key={product._id}
                  product={product}
                  themeConfig={themeConfig}
                  storeName={storeData?.name}
                  storeLogo={storeData?.logo}
                  storeWhatsAppPhone={storeData?.whatsappWidget?.phoneNumber}
                  onQuickView={openQuickView}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontFeaturesBar />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StorefrontPromoBanner storeData={storeData} onShopNow={scrollToProducts} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <StorefrontTestimonials />
        </div>

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
  }

  /* Default theme layout (unchanged functionality) */
  return (
    <div className="space-y-10 text-left">
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
              src={storeData?.bannerImage || themeConfig.heroImage}
              alt="Hero Showcase"
              className="max-h-72 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </div>

      <StorefrontAdvertisements advertisements={storeData?.advertisements} />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => openQuickView(product)}
              className={`group cursor-pointer overflow-hidden transition-all duration-300 ${themeConfig.productCard} ${themeConfig.cardRadius || 'rounded-2xl'} flex flex-col justify-between`}
            >
              <div>
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <span className="flex items-center gap-1.5 truncate">
                      {storeData?.logo ? <img src={storeData.logo} alt="" className="w-4 h-4 rounded object-contain" /> : null}
                      <span className="truncate">{storeData?.name || 'Store'}</span>
                    </span>
                    <span className="text-slate-400">{product.categoryId?.name || 'General'}</span>
                  </div>
                </div>
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img
                    src={product.thumbnail || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.badge && (
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${themeConfig.saleBadge}`}>
                      {product.badge}
                    </span>
                  )}
                  {product.salePrice > 0 && (
                    <span className={`absolute top-3 ${product.badge ? 'left-24' : 'left-3'} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${themeConfig.saleBadge}`}>
                      -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  )}

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${product.stockQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} IN STOCK` : 'OUT OF STOCK'}
                  </span>
                  <h3 className={`font-bold text-sm line-clamp-2 group-hover:opacity-70 transition-colors ${themeConfig.isDark ? 'text-white' : 'text-slate-900'} ${themeConfig.fontHeading}`}>
                    {product.name}
                  </h3>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between">
                <div className="flex items-baseline space-x-1.5">
                  <span className={`text-base font-black font-mono ${themeConfig.isDark ? 'text-white' : 'text-slate-900'}`}>
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
                  className={`p-2.5 rounded-xl transition-transform active:scale-95 shadow-2xs ${themeConfig.cartBtn}`}
                  title="Add to cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
