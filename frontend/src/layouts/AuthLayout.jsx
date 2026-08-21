import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-4">
          <BrandLogo className="h-12 w-12 rounded-2xl shadow-lg" />
          <span className="text-2xl font-black tracking-tight text-white">WhatsStore</span>
        </Link>
        <p className="text-xs font-medium text-slate-400">
          The Next-Gen Multi-Tenant WhatsApp Store Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
