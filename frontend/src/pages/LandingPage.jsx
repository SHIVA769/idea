import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  MessageCircle,
  BarChart2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';

export const LandingPage = () => {
  const [landingData, setLandingData] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await api.get('/storefront/landing');
        if (res.data?.success) {
          setLandingData(res.data.data.landing);
          setPlans(res.data.data.plans || []);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };
    fetchLanding();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-emerald-500 to-teal-400 flex items-center justify-center font-black text-white text-lg shadow-lg">
              WS
            </div>
            <span className="text-xl font-black tracking-tight text-white">WhatsStore</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition-all transform active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-extrabold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation WhatsApp E-Commerce SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
            Build High-Converting <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">WhatsApp Stores</span> in Seconds
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn your social traffic into instant WhatsApp orders. Multi-theme design systems, 3-step checkout wizard, automated messaging, and powerful store management.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Your Store Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/store/home-decor-store"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Store className="w-4 h-4" />
              <span>Explore Live Storefront Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Everything You Need to Scale online</h2>
            <p className="text-xs text-slate-400">Enterprise-grade multi-tenant architecture designed for conversion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'WhatsApp Direct Ordering',
                desc: 'Instant 1-click cart confirmation directly to your WhatsApp with pre-formatted itemized receipts.',
              },
              {
                icon: Layers,
                title: '7 Swappable Themes',
                desc: 'Tailored aesthetic presets for Home Decor, Fashion, Electronics, Bakery, Grocery, Automotive, and Toys.',
              },
              {
                icon: BarChart2,
                title: 'Analytics & Multi-Store',
                desc: 'Track sales performance, customer growth, coupons, and orders across multiple stores in one dashboard.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-8 rounded-3xl bg-slate-900 border border-slate-800/90 space-y-4 hover:border-emerald-500/40 transition-colors">
                  <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-800/50">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© WhatsStore SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
};
