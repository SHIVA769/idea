import express from 'express';
import {
  getDashboardStats,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  resetCompanyPassword,
  getMediaFiles,
  uploadMediaFile,
  deleteMediaFile,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanRequests,
  updatePlanRequestStatus,
  getPlanOrders,
  getPlatformCoupons,
  createPlatformCoupon,
  updatePlatformCoupon,
  deletePlatformCoupon,
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  getLocationsData,
  createCountry,
  createState,
  createCity,
  getReferralAdminData,
  updateReferralSettings,
  updatePayoutRequestStatus,
  getLandingPageConfig,
  saveLandingPageConfig,
  getCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
  getSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  getContactInquiries,
  deleteContactInquiry,
  getEmailTemplates,
  updateEmailTemplate,
  getNotificationTemplates,
  updateNotificationTemplate,
  getSettings,
  updateSystemSettings,
  updateBrandSettings,
  updateCurrencySettings,
  updateEmailSettings,
  sendTestEmail,
  updatePaymentGatewaySettings,
  updateStorageSettings,
  updateRecaptchaSettings,
  updateChatGptSettings,
  updateCookieSettings,
  getCookieLogs,
  updateSeoSettings,
  clearCache,
} from '../controllers/superAdminController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Enforce Super Admin on all endpoints in this router
router.use(authenticate, requireRole([ROLES.SUPER_ADMIN]));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Companies
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);
router.post('/companies/:id/reset-password', resetCompanyPassword);

// Media
router.get('/media', getMediaFiles);
router.post('/media/upload', upload.single('file'), uploadMediaFile);
router.delete('/media/:id', deleteMediaFile);

// Plans
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);
router.get('/plan-requests', getPlanRequests);
router.put('/plan-requests/:id', updatePlanRequestStatus);
router.get('/plan-orders', getPlanOrders);

// Platform Coupons
router.get('/coupons', getPlatformCoupons);
router.post('/coupons', createPlatformCoupon);
router.put('/coupons/:id', updatePlatformCoupon);
router.delete('/coupons/:id', deletePlatformCoupon);

// Currencies
router.get('/currencies', getCurrencies);
router.post('/currencies', createCurrency);
router.put('/currencies/:id', updateCurrency);
router.delete('/currencies/:id', deleteCurrency);

// Locations (Cascading Country -> State -> City)
router.get('/locations', getLocationsData);
router.post('/countries', createCountry);
router.post('/states', createState);
router.post('/cities', createCity);

// Referral Program
router.get('/referrals', getReferralAdminData);
router.put('/referrals/settings', updateReferralSettings);
router.put('/referrals/payouts/:id', updatePayoutRequestStatus);

// Landing Builder & Content
router.get('/landing-builder', getLandingPageConfig);
router.post('/landing-builder', saveLandingPageConfig);
router.get('/custom-pages', getCustomPages);
router.post('/custom-pages', createCustomPage);
router.put('/custom-pages/:id', updateCustomPage);
router.delete('/custom-pages/:id', deleteCustomPage);
router.get('/subscribers', getSubscribers);
router.put('/subscribers/:id', updateSubscriberStatus);
router.delete('/subscribers/:id', deleteSubscriber);
router.get('/contacts', getContactInquiries);
router.delete('/contacts/:id', deleteContactInquiry);

// Templates
router.get('/templates/email', getEmailTemplates);
router.put('/templates/email/:id', updateEmailTemplate);
router.get('/templates/notification', getNotificationTemplates);
router.put('/templates/notification/:id', updateNotificationTemplate);

// Settings
router.get('/settings', getSettings);
router.put('/settings/system', updateSystemSettings);
router.put('/settings/brand', updateBrandSettings);
router.put('/settings/currency', updateCurrencySettings);
router.put('/settings/email', updateEmailSettings);
router.post('/settings/email/test', sendTestEmail);
router.put('/settings/payments', updatePaymentGatewaySettings);
router.put('/settings/storage', updateStorageSettings);
router.put('/settings/recaptcha', updateRecaptchaSettings);
router.put('/settings/chatgpt', updateChatGptSettings);
router.put('/settings/cookie', updateCookieSettings);
router.get('/settings/cookie/logs', getCookieLogs);
router.put('/settings/seo', updateSeoSettings);
router.post('/settings/cache/clear', clearCache);

export default router;
