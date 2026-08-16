import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store as StoreIcon,
  Package,
  Layers,
  Receipt,
  ShoppingCart,
  Users,
  Tag,
  Truck,
  BarChart3,
  UserCheck,
  CreditCard,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  PlusCircle,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import { QRCodeModal } from '../components/common/QRCodeModal';

export const CompanyLayout = () => {
  const { user, logout, activeStore, setActiveStore, hasPermission } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { currentLang, activeLanguages, switchLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await api.get('/company/stores');
        if (res.data?.success && res.data.data.stores?.length > 0) {
          const fetchedStores = res.data.data.stores;
          setStores(fetchedStores);
          if (!activeStore) {
            setActiveStore(fetchedStores[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch company stores:', err);
      }
    };
    fetchStores();
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/company', icon: LayoutDashboard, perm: 'dashboard.view' },
    { label: 'Stores', path: '/company/stores', icon: StoreIcon, perm: 'stores.view' },
    { label: 'Products', path: '/company/products', icon: Package, perm: 'products.view' },
    { label: 'Categories', path: '/company/categories', icon: Layers, perm: 'categories.view' },
    { label: 'Tax Rules', path: '/company/tax', icon: Receipt, perm: 'tax.view' },
    { label: 'Orders', path: '/company/orders', icon: ShoppingCart, perm: 'orders.view' },
    { label: 'Customers', path: '/company/customers', icon: Users, perm: 'customers.view' },
    { label: 'Store Coupons', path: '/company/coupons', icon: Tag, perm: 'coupons.view' },
    { label: 'Shipping Methods', path: '/company/shipping', icon: Truck, perm: 'shipping.view' },
    { label: 'Analytics & Reports', path: '/company/analytics', icon: BarChart3, perm: 'analytics.view' },
    { label: 'Staff & Roles', path: '/company/staff', icon: UserCheck, perm: 'users.view' },
    { label: 'Plans & Billing', path: '/company/plans', icon: CreditCard, perm: 'plans.view' },
    { label: 'Referral Program', path: '/company/referrals', icon: Share2, perm: 'referral.view' },
    { label: 'Settings', path: '/company/settings', icon: Settings, perm: 'settings.view' },
  ];

  const currentStoreUrl = activeStore
    ? `${window.location.origin}/store/${activeStore.slug}`
    : `${window.location.origin}/store/artisan-living`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-200">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex flex-col border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link to="/company" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white shadow-md">
              WS
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">WhatsStore</span>
              <span className="block text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">Merchant Portal</span>
            </div>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Selection Pill */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <StoreIcon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeStore ? activeStore.name : 'Select Store'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {activeStore?.theme || 'Default Theme'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isStoreDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1">
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {stores.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => {
                        setActiveStore(s);
                        setIsStoreDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        activeStore?._id === s._id
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                        {s.theme?.replace('theme-', '')}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700">
                  <Link
                    to="/company/stores"
                    onClick={() => setIsStoreDropdownOpen(false)}
                    className="flex items-center space-x-1.5 w-full px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Store</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navItems.map((item) => {
            if (item.perm && !hasPermission(item.perm)) return null;

            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/company' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Store Owner'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.company?.name || 'Luxe Retail'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 hover:border-rose-200 rounded-lg text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Live Store Quick Link & QR */}
            {activeStore && (
              <div className="flex items-center space-x-2">
                <a
                  href={`/store/${activeStore.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Visit Storefront
                </a>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  title="Generate Store QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => switchLanguage(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {activeLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Toggle theme mode"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Store QR Code Modal */}
      {activeStore && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          storeName={activeStore.name}
          storeUrl={currentStoreUrl}
        />
      )}
    </div>
  );
};
