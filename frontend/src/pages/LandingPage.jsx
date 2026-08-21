import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CirclePlay,
  Menu,
  MessageCircle,
  PackageCheck,
  QrCode,
  ShoppingBag,
  Smartphone,
  X,
} from 'lucide-react';
import api from '../api/axios';
import { BrandLogo } from '../components/common/BrandLogo';

const featureItems = [
  { icon: PackageCheck, title: 'Easy Setup', text: 'Create your store in just a few minutes.' },
  { icon: MessageCircle, title: 'No Commissions', text: 'Keep more of what you earn with every order.' },
  { icon: Smartphone, title: 'WhatsApp Integrated', text: 'Sell where your customers already chat.' },
  { icon: ShoppingBag, title: 'Carts & Orders', text: 'Make buying simple from first click to checkout.' },
  { icon: QrCode, title: 'Secure & Reliable', text: 'A fast, trusted storefront for your business.' },
];

const showcaseImage = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=85';

export const LandingPage = () => {
  const [landingData, setLandingData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await api.get('/storefront/landing');
        if (res.data?.success) setLandingData(res.data.data.landing);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };
    fetchLanding();
  }, []);

  const companyName = landingData?.setup?.companyName || 'WhatsStore';

  return (
    <div className="landing-page min-h-screen overflow-hidden bg-[#fbfffc] text-[#12372b]">
      <header className="landing-header">
        <div className="landing-shell flex h-[76px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="WhatsStore home">
            <BrandLogo className="h-11 w-11 rounded-xl" />
            <span className="text-[19px] font-extrabold tracking-[-0.04em] text-[#133d2c]">{companyName.replace(' SaaS', '')}</span>
          </Link>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} landing-nav absolute left-4 right-4 top-[68px] flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-7 md:bg-transparent md:p-0 md:shadow-none`}>
            <a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#themes">Categories</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a>
          </nav>
          <div className="hidden items-center gap-5 md:flex"><Link to="/login" className="text-sm font-bold text-[#173c2d] hover:text-[#0aa76d]">Login</Link><Link to="/register" className="landing-button landing-button-small">Get Started <ArrowRight className="h-4 w-4" /></Link></div>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-shell grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
            <div className="relative z-10 max-w-xl"><div className="landing-kicker"><span className="h-2 w-2 rounded-full bg-[#0aa76d]" /> WhatsApp Commerce Made Simple</div><h1>Sell on WhatsApp.<br /><span>Grow Your Business.</span></h1><p className="landing-lede">Create your online store and start taking orders on WhatsApp in just a few minutes. No coding, no hassle.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/register" className="landing-button">Start Your Store Now <ArrowRight className="h-4 w-4" /></Link><a href="#how-it-works" className="landing-button landing-button-quiet"><CirclePlay className="h-4 w-4" /> How It Works</a></div><div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#587268]"><span><Check /> Free to get started</span><span><Check /> No credit card required</span></div></div>
            <div className="landing-visual" aria-label="WhatsStore storefront preview"><div className="landing-sun" /><div className="store-preview"><div className="store-topbar"><span className="store-mark">waply</span><div className="hidden gap-4 text-[7px] font-bold text-[#326b4d] sm:flex"><span>Home</span><span>Features</span><span>How It Works</span><span>Pricing</span></div><span className="store-dot" /></div><div className="store-copy"><small>SELL ON WHATSAPP</small><strong>Grow your<br />business.</strong><p>Everything you need to sell online and start taking orders.</p><button type="button">Start Selling Now <ArrowRight /></button></div><img src={showcaseImage} alt="Online store products" /><div className="store-chips"><span>New collection</span><span>Fast checkout</span><span>WhatsApp orders</span></div></div><div className="phone-preview"><div className="phone-notch" /><div className="phone-screen"><div className="phone-header"><span>waply</span><ShoppingBag /></div><div className="phone-banner"><b>SUMMER<br />COLLECTION</b><span>Shop now</span></div><div className="phone-label">Top Products</div><div className="phone-products"><i /><i /><i /></div><div className="phone-whatsapp"><MessageCircle /></div></div></div></div>
          </div>
        </section>

        <section id="features" className="landing-features"><div className="landing-shell"><div className="section-heading"><span>WHY CHOOSE WAPLY?</span><h2>Everything You Need to Sell Online</h2><p>Powerful tools to help you start, grow, and manage your online business.</p></div><div className="feature-row">{featureItems.map(({ icon: Icon, title, text }) => <div className="feature-item" key={title}><div className="feature-icon"><Icon /></div><strong>{title}</strong><p>{text}</p></div>)}</div></div></section>
        <section id="how-it-works" className="landing-steps"><div className="landing-shell"><div className="section-heading"><span>HOW IT WORKS</span><h2>Start Selling in 3 Simple Steps</h2></div><div className="steps-row"><div><b>1</b><strong>Create Your Store</strong><p>Sign up and choose your store name.</p></div><div><b>2</b><strong>Add &amp; Share Products</strong><p>Upload products and share your link.</p></div><div><b>3</b><strong>Receive Orders</strong><p>Get orders directly on WhatsApp.</p></div></div></div></section>
      </main>
      <footer id="contact" className="landing-footer">© WhatsStore. Sell simply, grow freely.</footer>
    </div>
  );
};
