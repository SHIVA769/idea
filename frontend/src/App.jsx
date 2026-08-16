import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { CompanyLayout } from './layouts/CompanyLayout';
import { StorefrontLayout } from './layouts/StorefrontLayout';

// Public Landing
import { LandingPage } from './pages/LandingPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ManageLanguages } from './pages/auth/ManageLanguages';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/superAdmin/Dashboard';
import { Companies } from './pages/superAdmin/Companies';
import { MediaLibrary } from './pages/superAdmin/MediaLibrary';
import { Plans } from './pages/superAdmin/Plans';
import { PlatformCoupons } from './pages/superAdmin/PlatformCoupons';
import { Currencies } from './pages/superAdmin/Currencies';
import { Locations } from './pages/superAdmin/Locations';
import { ReferralProgram } from './pages/superAdmin/ReferralProgram';
import { LandingPageBuilder } from './pages/superAdmin/LandingPageBuilder';
import { EmailTemplates } from './pages/superAdmin/EmailTemplates';
import { NotificationTemplates } from './pages/superAdmin/NotificationTemplates';
import { Settings as SuperAdminSettings } from './pages/superAdmin/Settings';

// Company Owner Pages
import { CompanyDashboard } from './pages/company/Dashboard';
import { Stores } from './pages/company/Stores';
import { Products } from './pages/company/Products';
import { Categories } from './pages/company/Categories';
import { Tax } from './pages/company/Tax';
import { Orders } from './pages/company/Orders';
import { Customers } from './pages/company/Customers';
import { StoreCoupons } from './pages/company/StoreCoupons';
import { Shipping } from './pages/company/Shipping';
import { Analytics } from './pages/company/Analytics';
import { StaffManagement } from './pages/company/StaffManagement';
import { CompanyPlans } from './pages/company/CompanyPlans';
import { CompanyReferrals } from './pages/company/CompanyReferrals';
import { CompanySettings } from './pages/company/CompanySettings';

// Storefront Pages
import { StorefrontHome } from './pages/storefront/StorefrontHome';
import { StorefrontCheckout } from './pages/storefront/StorefrontCheckout';
import { OrderSuccess } from './pages/storefront/OrderSuccess';
import { StoreCustomerAccount } from './pages/storefront/StoreCustomerAccount';

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/manage-languages" element={<ManageLanguages />} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="plans" element={<Plans />} />
        <Route path="coupons" element={<PlatformCoupons />} />
        <Route path="currencies" element={<Currencies />} />
        <Route path="locations" element={<Locations />} />
        <Route path="referrals" element={<ReferralProgram />} />
        <Route path="landing-builder" element={<LandingPageBuilder />} />
        <Route path="templates/email" element={<EmailTemplates />} />
        <Route path="templates/notification" element={<NotificationTemplates />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      {/* Company / Merchant Routes */}
      <Route path="/company" element={<CompanyLayout />}>
        <Route index element={<CompanyDashboard />} />
        <Route path="stores" element={<Stores />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="tax" element={<Tax />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<StoreCoupons />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="plans" element={<CompanyPlans />} />
        <Route path="referrals" element={<CompanyReferrals />} />
        <Route path="settings" element={<CompanySettings />} />
      </Route>

      {/* Storefront Routes */}
      <Route path="/store/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorefrontHome />} />
        <Route path="checkout" element={<StorefrontCheckout />} />
        <Route path="order-success/:orderId" element={<OrderSuccess />} />
        <Route path="customer/login" element={<StoreCustomerAccount />} />
        <Route path="customer/profile" element={<StoreCustomerAccount />} />
        <Route path="customer/orders" element={<StoreCustomerAccount />} />
      </Route>

      {/* Fallback wildcard route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
