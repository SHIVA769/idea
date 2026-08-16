import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Plus,
  QrCode,
  ExternalLink,
  Settings,
  Edit,
  Trash2,
  CheckCircle,
  Palette,
  MessageCircle,
  Smartphone,
  Layers,
} from 'lucide-react';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { QRCodeModal } from '../../components/common/QRCodeModal';
import { AddressCascade } from '../../components/common/AddressCascade';
import { STORE_THEMES } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export const Stores = () => {
  const { activeStore, setActiveStore } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrStoreTarget, setQrStoreTarget] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Form State
  const [storeForm, setStoreForm] = useState({
    name: '',
    slug: '',
    theme: 'theme-home-decor',
    welcomeMessage: 'Welcome to our official online store! Enjoy direct WhatsApp ordering.',
    copyrightText: '© WhatsStore. All rights reserved.',
    address: { street: '', country: 'United States', state: 'California', city: 'Los Angeles', postalCode: '90001' },
    whatsappWidget: {
      enabled: true,
      phoneNumber: '+14155552671',
      defaultMessage: 'Hi! I want to inquire about products in your catalog.',
      position: 'bottom-right',
      showOnMobile: true,
      showOnDesktop: true,
    },
    pwaSettings: {
      enabled: true,
      appName: 'My Store',
      shortName: 'Store',
      themeColor: '#0284c7',
      backgroundColor: '#ffffff',
    },
    customCSS: '',
    customJS: '',
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/company/stores');
      if (res.data?.success) {
        setStores(res.data.data.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSaveStore = async (e) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await api.put(`/company/stores/${editingStore._id}`, storeForm);
      } else {
        await api.post('/company/stores', storeForm);
      }
      setIsStoreModalOpen(false);
      setEditingStore(null);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save store');
    }
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name,
      slug: store.slug,
      theme: store.theme || 'theme-home-decor',
      welcomeMessage: store.welcomeMessage || '',
      copyrightText: store.copyrightText || '',
      address: store.address || { street: '', country: 'United States', state: 'California', city: 'Los Angeles', postalCode: '90001' },
      whatsappWidget: store.whatsappWidget || {
        enabled: true,
        phoneNumber: '+14155552671',
        defaultMessage: 'Hi! I want to inquire about products.',
        position: 'bottom-right',
        showOnMobile: true,
        showOnDesktop: true,
      },
      pwaSettings: store.pwaSettings || { enabled: true, appName: store.name, shortName: 'Store', themeColor: '#0284c7', backgroundColor: '#ffffff' },
      customCSS: store.customCSS || '',
      customJS: store.customJS || '',
    });
    setActiveFormTab('basic');
    setIsStoreModalOpen(true);
  };

  const formTabs = [
    { id: 'basic', label: '1. Basic Info & Theme' },
    { id: 'whatsapp', label: '2. WhatsApp Widget' },
    { id: 'pwa', label: '3. PWA & Advanced' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Store Channels</h1>
          <p className="text-xs text-slate-500">Manage storefront instances, swappable themes & WhatsApp integration</p>
        </div>
        <button
          onClick={() => {
            setEditingStore(null);
            setStoreForm({
              name: '',
              slug: '',
              theme: 'theme-home-decor',
              welcomeMessage: 'Welcome to our store! Enjoy fast delivery and direct WhatsApp ordering.',
              copyrightText: '© WhatsStore. All rights reserved.',
              address: { street: '', country: 'United States', state: 'California', city: 'Los Angeles', postalCode: '90001' },
              whatsappWidget: { enabled: true, phoneNumber: '+14155552671', defaultMessage: 'Hi! I need help.', position: 'bottom-right', showOnMobile: true, showOnDesktop: true },
              pwaSettings: { enabled: true, appName: 'My Store', shortName: 'Store', themeColor: '#0284c7', backgroundColor: '#ffffff' },
              customCSS: '',
              customJS: '',
            });
            setActiveFormTab('basic');
            setIsStoreModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Store
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => {
          const storeUrl = `${window.location.origin}/store/${store.slug}`;
          const isSelected = activeStore?._id === store._id;

          return (
            <div
              key={store._id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-2xs space-y-4 relative ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-3 right-4 px-3 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  Active Channel
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{store.name}</h3>
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-mono">/store/{store.slug}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {store.theme?.replace('theme-', '')}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                {store.welcomeMessage || 'No welcome message configured'}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <a
                    href={`/store/${store.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-600 hover:text-emerald-600 rounded-lg hover:bg-slate-100"
                    title="Visit Storefront"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setQrStoreTarget(store);
                      setIsQRModalOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    title="QR Code & Share"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(store)}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    title="Edit Store Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {!isSelected && (
                  <button
                    onClick={() => setActiveStore(store)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 rounded-xl transition-colors"
                  >
                    Switch to this
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Tab Store Modal */}
      <Modal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title={editingStore ? `Edit Store: ${editingStore.name}` : 'Create New Store'}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-left">
          <Tabs tabs={formTabs} activeTab={activeFormTab} onChange={setActiveFormTab} variant="pills" />

          <form onSubmit={handleSaveStore} className="space-y-4 pt-2">
            {/* Tab 1: Basic Info & Theme */}
            {activeFormTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Modern Living Decor"
                      value={storeForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        setStoreForm({ ...storeForm, name, slug: storeForm.slug || slug });
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Slug URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="modern-living-decor"
                      value={storeForm.slug}
                      onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* 7 Swappable Themes Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Store Theme (Select from 7 Category Blueprints)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                    {STORE_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setStoreForm({ ...storeForm, theme: t.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          storeForm.theme === t.id
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-2 rounded-full mb-2" style={{ backgroundColor: t.primaryColor }} />
                        <p className="text-xs font-bold truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t.category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Welcome Announcement Text</label>
                  <input
                    type="text"
                    value={storeForm.welcomeMessage}
                    onChange={(e) => setStoreForm({ ...storeForm, welcomeMessage: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                {/* Address Cascade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Store Dispatch Address</label>
                  <AddressCascade values={storeForm.address} onChange={(addr) => setStoreForm({ ...storeForm, address: addr })} />
                </div>
              </div>
            )}

            {/* Tab 2: WhatsApp Widget */}
            {activeFormTab === 'whatsapp' && (
              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={storeForm.whatsappWidget?.enabled}
                    onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, enabled: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Enable Floating WhatsApp Direct Chat Widget</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">WhatsApp Business Phone (with country code)</label>
                    <input
                      type="text"
                      placeholder="+14155552671"
                      value={storeForm.whatsappWidget?.phoneNumber || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, phoneNumber: e.target.value } })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Widget Screen Position</label>
                    <select
                      value={storeForm.whatsappWidget?.position || 'bottom-right'}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, position: e.target.value } })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pre-filled Chat Message</label>
                  <textarea
                    rows={3}
                    value={storeForm.whatsappWidget?.defaultMessage || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, defaultMessage: e.target.value } })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>

                <div className="flex items-center space-x-6 text-xs font-semibold">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storeForm.whatsappWidget?.showOnMobile}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, showOnMobile: e.target.checked } })}
                      className="rounded text-emerald-600"
                    />
                    <span>Show on Mobile</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={storeForm.whatsappWidget?.showOnDesktop}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappWidget: { ...storeForm.whatsappWidget, showOnDesktop: e.target.checked } })}
                      className="rounded text-emerald-600"
                    />
                    <span>Show on Desktop</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: PWA & Advanced */}
            {activeFormTab === 'pwa' && (
              <div className="space-y-4 text-xs">
                <label className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={storeForm.pwaSettings?.enabled}
                    onChange={(e) => setStoreForm({ ...storeForm, pwaSettings: { ...storeForm.pwaSettings, enabled: e.target.checked } })}
                    className="rounded text-primary-600"
                  />
                  <span>Enable Progressive Web App (PWA) Install Prompt</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">PWA App Name</label>
                    <input
                      type="text"
                      value={storeForm.pwaSettings?.appName || ''}
                      onChange={(e) => setStoreForm({ ...storeForm, pwaSettings: { ...storeForm.pwaSettings, appName: e.target.value } })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">PWA Theme Color</label>
                    <input
                      type="text"
                      value={storeForm.pwaSettings?.themeColor || '#0284c7'}
                      onChange={(e) => setStoreForm({ ...storeForm, pwaSettings: { ...storeForm.pwaSettings, themeColor: e.target.value } })}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Custom Storefront CSS</label>
                  <textarea
                    rows={3}
                    placeholder="/* Custom CSS */"
                    value={storeForm.customCSS || ''}
                    onChange={(e) => setStoreForm({ ...storeForm, customCSS: e.target.value })}
                    className="w-full p-2 font-mono bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" onClick={() => setIsStoreModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                Save Store Channel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* QR Modal */}
      {qrStoreTarget && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          storeName={qrStoreTarget.name}
          storeUrl={`${window.location.origin}/store/${qrStoreTarget.slug}`}
        />
      )}
    </div>
  );
};
