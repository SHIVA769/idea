import { Company } from '../models/Company.js';
import { Plan } from '../models/Plan.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/ECommerce.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/response.js';
import { ROLES } from '../config/constants.js';

export const getCompanyActivePlan = async (companyId) => {
  const company = await Company.findById(companyId).populate('planId');
  if (!company) return null;

  if (company.planId) {
    return company.planId;
  }

  // Fallback to default plan
  const defaultPlan = await Plan.findOne({ isDefault: true, isActive: true });
  return defaultPlan;
};

/**
 * Enforces maximum stores allowed under company plan
 */
export const checkStoreLimit = async (req, res, next) => {
  try {
    if (req.user.role === ROLES.SUPER_ADMIN) return next();

    const companyId = req.effectiveCompanyId || req.user.companyId;
    const plan = await getCompanyActivePlan(companyId);

    if (!plan) {
      return sendError(res, 'No active subscription plan found. Please subscribe to a plan.', 403);
    }

    const currentStoreCount = await Store.countDocuments({ companyId });
    if (currentStoreCount >= plan.maxStores) {
      return sendError(
        res,
        `Plan limit exceeded: Your current plan allows maximum ${plan.maxStores} store(s). Upgrade your plan to create more stores.`,
        403
      );
    }

    // Check theme allowed
    if (req.body.theme && plan.themes && plan.themes.length > 0) {
      if (!plan.themes.includes(req.body.theme)) {
        return sendError(
          res,
          `The selected theme '${req.body.theme}' is not included in your current subscription plan. Available themes: ${plan.themes.join(', ')}`,
          403
        );
      }
    }

    // Check custom domain feature flag
    if (req.body.domainConfig?.customDomainEnabled && !plan.features?.customDomain) {
      return sendError(res, 'Custom Domain mapping is not supported on your current plan. Upgrade to enable Custom Domains.', 403);
    }

    // Check PWA feature flag
    if (req.body.pwaConfig?.enabled && !plan.features?.pwa) {
      return sendError(res, 'PWA Mobile App feature is not supported on your current plan. Upgrade to enable PWA.', 403);
    }

    next();
  } catch (error) {
    console.error('Check store limit error:', error);
    return sendError(res, 'Failed to verify plan store limits.', 500);
  }
};

/**
 * Enforces maximum products allowed per store under company plan
 */
export const checkProductLimit = async (req, res, next) => {
  try {
    if (req.user.role === ROLES.SUPER_ADMIN) return next();

    const companyId = req.effectiveCompanyId || req.user.companyId;
    const storeId = req.body.storeId || req.params.storeId;

    if (!storeId) {
      return sendError(res, 'Store ID is required to create a product.', 400);
    }

    const plan = await getCompanyActivePlan(companyId);
    if (!plan) {
      return sendError(res, 'No active subscription plan found.', 403);
    }

    const currentProductCount = await Product.countDocuments({ storeId });
    if (currentProductCount >= plan.maxProductsPerStore) {
      return sendError(
        res,
        `Plan limit exceeded: Your current plan allows maximum ${plan.maxProductsPerStore} product(s) per store. Upgrade your plan to add more products.`,
        403
      );
    }

    next();
  } catch (error) {
    console.error('Check product limit error:', error);
    return sendError(res, 'Failed to verify plan product limits.', 500);
  }
};

/**
 * Enforces maximum staff users allowed under company plan
 */
export const checkUserLimit = async (req, res, next) => {
  try {
    if (req.user.role === ROLES.SUPER_ADMIN) return next();

    const companyId = req.effectiveCompanyId || req.user.companyId;
    const plan = await getCompanyActivePlan(companyId);

    if (!plan) {
      return sendError(res, 'No active subscription plan found.', 403);
    }

    const currentStaffCount = await User.countDocuments({ companyId, role: { $ne: ROLES.CUSTOMER } });
    if (currentStaffCount >= plan.maxUsersPerStore) {
      return sendError(
        res,
        `Plan limit exceeded: Your current plan allows maximum ${plan.maxUsersPerStore} staff user(s). Upgrade your plan to invite more team members.`,
        403
      );
    }

    next();
  } catch (error) {
    console.error('Check user limit error:', error);
    return sendError(res, 'Failed to verify plan user limits.', 500);
  }
};
