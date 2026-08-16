import crypto from 'crypto';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Plan } from '../models/Plan.js';
import { SystemSettings } from '../models/Settings.js';
import { generateToken } from '../middlewares/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendEmail } from '../services/mailer.js';
import { ROLES } from '../config/constants.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists.', 400);
    }

    // Check system settings for registration / verification
    const systemSettings = await SystemSettings.findOne({ companyId: null });
    if (systemSettings && systemSettings.userRegistrationEnabled === false) {
      return sendError(res, 'Public user registration is currently disabled by administrator.', 403);
    }

    // Default plan assignment
    const defaultPlan = await Plan.findOne({ isDefault: true, isActive: true }) || await Plan.findOne({ isActive: true });

    // Create Company
    const referralCode = `WS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const company = await Company.create({
      name: companyName || `${name}'s Company`,
      email: email.toLowerCase(),
      planId: defaultPlan?._id || null,
      planBillingCycle: 'monthly',
      referralCode,
      status: 'active',
      enableLogin: true,
    });

    const verificationToken = crypto.randomBytes(24).toString('hex');
    const requiresVerification = systemSettings?.emailVerification || false;

    // Create User (Company Owner)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ROLES.COMPANY_OWNER,
      companyId: company._id,
      emailVerified: !requiresVerification,
      verificationToken: requiresVerification ? verificationToken : null,
      status: 'active',
    });

    if (requiresVerification) {
      const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your WhatsStore Account',
        html: `<h2>Welcome to WhatsStore!</h2><p>Please verify your email address by clicking below:</p><a href="${verifyUrl}">Verify Account</a>`,
      });
    }

    const token = generateToken({ userId: user._id, role: user.role, companyId: company._id });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          companyId: company._id,
          companyName: company.name,
          emailVerified: user.emailVerified,
        },
      },
      'Account created successfully.',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError(res, error.message, 500);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('roleId');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.status === 'disabled' || user.status === 'inactive') {
      return sendError(res, 'Your account is disabled. Please contact administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId).populate('planId');
      if (company && !company.enableLogin && user.role !== ROLES.SUPER_ADMIN) {
        return sendError(res, 'Login is disabled for your company.', 403);
      }
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      companyId: user.companyId,
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          companyId: user.companyId,
          company: company ? { id: company._id, name: company.name, plan: company.planId } : null,
          permissions: user.roleId?.permissions || (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.COMPANY_OWNER ? ['*'] : []),
        },
      },
      'Logged in successfully.'
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error.message, 500);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('roleId');
    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId).populate('planId');
    }

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        companyId: user.companyId,
        company: company ? { id: company._id, name: company.name, plan: company.planId, referralCode: company.referralCode } : null,
        permissions: user.roleId?.permissions || (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.COMPANY_OWNER ? ['*'] : []),
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar, phone, preferredLanguage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return sendError(res, 'Email already in use by another user.', 400);
      }
      user.email = email.toLowerCase();
    }

    await user.save();
    return sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required.', 400);
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password does not match.', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully.');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email is required.', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendSuccess(res, null, 'If this email exists, a password reset link has been dispatched.');
    }

    const token = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request — WhatsStore',
      html: `<p>You requested a password reset. Click the link below to set a new password:</p><a href="${resetUrl}">${resetUrl}</a><p>This link expires in 1 hour.</p>`,
    });

    return sendSuccess(res, null, 'If this email exists, a password reset link has been dispatched.');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required.', 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset link.', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return sendSuccess(res, null, 'Password has been reset successfully. Please sign in with your new password.');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const impersonateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return sendError(res, 'Company not found.', 404);
    }

    const ownerUser = await User.findOne({ companyId, role: ROLES.COMPANY_OWNER }) || await User.findOne({ companyId });
    if (!ownerUser) {
      return sendError(res, 'No user found for this company.', 404);
    }

    // Generate short-lived impersonation token (1 hour)
    const token = generateToken({
      userId: ownerUser._id,
      role: ownerUser.role,
      companyId: company._id,
      impersonatedCompanyId: company._id,
    }, '1h');

    return sendSuccess(res, { token, company, user: ownerUser }, `Logged in as company ${company.name}`);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
