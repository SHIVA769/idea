import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Phone, MapPin, Search, ChevronRight, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getThemeConfig } from '../themes/themeRegistry';
import { WhatsAppFloatingWidget } from '../components/common/WhatsAppFloatingWidget';
import { CartDrawer } from '../pages/storefront/CartDrawer';
import { CookieConsentBanner } from '../components/common/CookieConsentBanner';
import api from '../api/axios';

export const StorefrontLayout = () => {
  const { slug } = useParams();
  const { user, logout } = useAuth();
  const { items, setIsDrawerOpen, totalItemCount, initStoreCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      initStoreCart(slug);
      const fetchStore = async () => {
        try {
          const res = await api.get(`/storefront/${slug}`);
          if (res.data?.success) {
            setStoreData(res.data.data.store);
          }
        } catch (err) {
          console.error('Failed to load store:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchStore();
    }
  }, [slug]);

  const themeConfig = getThemeConfig(storeData?.theme || 'theme-home-decor');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-slate-500">Opening store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeConfig.bgPage} text-slate-900 flex flex-col transition-colors duration-300 font-sans`}>
      {/* Top Announcement Bar */}
      {storeData?.welcomeMessage && (
        <div className="bg-slate-900 text-white text-[11px] py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{storeData.welcomeMessage}</span>
          {storeData.address?.city && (
            <span className="hidden sm:inline opacity-75">• Fast shipping from {storeData.address.city}, {storeData.address.country}</span>
          )}
        </div>
      )}

      {/* Main Storefront Header */}
      <header className={`sticky top-0 z-30 ${themeConfig.headerBg} transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Store Title */}
          <Link to={`/store/${slug}`} className="flex items-center space-x-3 group">
            {storeData?.logo ? (
              <img src={storeData.logo} alt={storeData.name} className="h-10 w-auto object-contain rounded-md" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {storeData?.name?.[0] || 'S'}
              </div>
            )}
            <div>
              <span className={`text-xl font-bold tracking-tight ${themeConfig.fontHeading} text-inherit block leading-tight`}>
                {storeData?.name || 'WhatsStore'}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                {themeConfig.name}
              </span>
            </div>
          </Link>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center space-x-3">
            {/* Customer Account Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 py-1.5 px-3 rounded-full border border-slate-200 hover:bg-slate-100/80 text-xs font-semibold"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{user.name?.split(' ')[0]}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 z-40 text-xs">
                      <Link
                        to={`/store/${slug}/customer/profile`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                      >
                        My Profile
                      </Link>
                      <Link
                        to={`/store/${slug}/customer/orders`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={`/store/${slug}/customer/login`}
                  className="inline-flex items-center py-1.5 px-3 rounded-full border border-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-sm ${themeConfig.cartBtn}`}
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-white text-slate-900 rounded-full text-[10px] font-black">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Storefront Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet context={{ storeData, themeConfig }} />
      </main>

      {/* Cart Drawer */}
      <CartDrawer storeSlug={slug} themeConfig={themeConfig} />

      {/* WhatsApp Floating Chat Widget */}
      <WhatsAppFloatingWidget config={storeData?.whatsappWidget} storeName={storeData?.name} />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Storefront Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xs text-slate-600 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold text-sm text-slate-900 mb-1">{storeData?.name}</p>
            <p className="text-slate-400">{storeData?.copyrightText || '© WhatsStore. All rights reserved.'}</p>
          </div>

          {storeData?.address?.street && (
            <div className="flex items-center space-x-2 text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{storeData.address.street}, {storeData.address.city}, {storeData.address.country}</span>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-400">Powered by</span>
            <span className="font-extrabold text-slate-900 tracking-tight">WhatsStore SaaS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
