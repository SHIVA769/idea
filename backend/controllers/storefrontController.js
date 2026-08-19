import { Store } from '../models/Store.js';
import { Product, Category, Tax, Order, Customer, ShippingMethod, CompanyMessagingSettings } from '../models/ECommerce.js';
import { StoreCoupon } from '../models/StoreCoupon.js';
import { Subscriber, ContactInquiry, LandingPageConfig, CustomPage } from '../models/LandingBuilder.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { renderOrderMessage } from '../utils/templateEngine.js';
import { sendEmail } from '../services/mailer.js';
import { sendTwilioSms } from '../services/twilioService.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { dispatchWebhook } from '../services/webhookService.js';
import { generateOrderInvoicePDF } from '../services/pdfInvoiceService.js';

// ==========================================
// 5.28 Public Storefront Endpoints
// ==========================================

const formatProductForStorefront = (product) => {
  const doc = product.toObject ? product.toObject() : { ...product };
  return {
    ...doc,
    thumbnail: doc.coverImage || doc.thumbnail || '',
  };
};

export const getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const store = await Store.findOne({ slug, status: 'active' });

    if (!store) {
      return sendError(res, 'Store not found or is currently inactive.', 404);
    }

    // Get company messaging settings for WhatsApp/Telegram/COD availability
    const messaging = await CompanyMessagingSettings.findOne({ companyId: store.companyId });

    const featuredCoupon = await StoreCoupon.findOne({
      storeId: store._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return sendSuccess(res, {
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        email: store.email,
        logo: store.logo,
        favicon: store.favicon,
        welcomeMessage: store.welcomeMessage,
        storeDescription: store.storeDescription,
        copyrightText: store.copyrightText,
        theme: store.theme || 'theme-home-decor',
        address: store.address,
        socialLinks: store.socialLinks,
        whatsappWidget: store.whatsappWidget,
        pwaConfig: store.pwaConfig,
        customCSS: store.customCSS,
        customJS: store.customJS,
        isMaintenance: store.isMaintenance,
        featuredCoupon: featuredCoupon
          ? {
              code: featuredCoupon.code,
              discountType: featuredCoupon.discountType,
              discountValue: featuredCoupon.discountValue,
              description: featuredCoupon.description,
            }
          : null,
      },
      paymentOptions: {
        codEnabled: messaging?.codEnabled ?? true,
        whatsappEnabled: messaging?.whatsappEnabled ?? true,
        whatsappNumber: messaging?.whatsappNumber || store.whatsappWidget?.phoneNumber || '',
        telegramEnabled: messaging?.telegramEnabled ?? false,
      },
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getStoreCatalog = async (req, res) => {
  try {
    const { slug } = req.params;
    const { category, search } = req.query;

    const store = await Store.findOne({ slug, status: 'active' });
    if (!store) return sendError(res, 'Store not found.', 404);

    const categories = await Category.find({ storeId: store._id, status: 'active' }).sort({ sortOrder: 1 });

    const productQuery = { storeId: store._id, status: 'active', isDisplay: true };

    if (category && category !== 'all') {
      const cat = categories.find((c) => c.slug === category || c._id.toString() === category);
      if (cat) productQuery.categoryId = cat._id;
    }

    if (search) {
      productQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(productQuery).populate('categoryId taxId').sort({ createdAt: -1 });

    return sendSuccess(res, {
      categories,
      products: products.map(formatProductForStorefront),
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getProductQuickView = async (req, res) => {
  try {
    const { slug, productId } = req.params;
    const store = await Store.findOne({ slug, status: 'active' });
    if (!store) return sendError(res, 'Store not found.', 404);

    const product = await Product.findOne({ _id: productId, storeId: store._id }).populate('categoryId taxId');
    if (!product) return sendError(res, 'Product not found.', 404);

    // Increment views count
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save();

    return sendSuccess(res, formatProductForStorefront(product));
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { slug } = req.params;
    const { code, subtotal = 0 } = req.body;

    if (!code) return sendError(res, 'Coupon code is required.', 400);

    const store = await Store.findOne({ slug });
    if (!store) return sendError(res, 'Store not found.', 404);

    const coupon = await StoreCoupon.findOne({
      storeId: store._id,
      code: code.toUpperCase().trim(),
      status: 'active',
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return sendError(res, 'Invalid or expired coupon code.', 400);
    }

    if (coupon.minSpend > 0 && subtotal < coupon.minSpend) {
      return sendError(res, `Minimum spend of $${coupon.minSpend} required to use this coupon.`, 400);
    }

    if (coupon.maxSpend > 0 && subtotal > coupon.maxSpend) {
      return sendError(res, `Maximum eligible spend for this coupon is $${coupon.maxSpend}.`, 400);
    }

    if (coupon.perCouponLimit > 0 && coupon.usedCount >= coupon.perCouponLimit) {
      return sendError(res, 'This coupon has reached its maximum usage limit.', 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return sendSuccess(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      description: coupon.description,
    }, 'Coupon applied successfully!');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getStoreShippingMethods = async (req, res) => {
  try {
    const { slug } = req.params;
    const store = await Store.findOne({ slug, status: 'active' });
    if (!store) return sendError(res, 'Store not found.', 404);

    const shippingMethods = await ShippingMethod.find({ storeId: store._id, status: 'active' }).sort({ sortOrder: 1 });
    return sendSuccess(res, shippingMethods);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * 3-Step Storefront Checkout Processor
 */
export const checkoutStoreOrder = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      contactInfo, // { firstName, lastName, email, phone, street, country, state, city, postalCode }
      items = [],
      shippingMethodId,
      couponCode,
      paymentMethod = 'WhatsApp',
      notes = '',
      isGuest = false,
    } = req.body;

    const store = await Store.findOne({ slug, status: 'active' });
    if (!store) return sendError(res, 'Store not found.', 404);

    if (!items || items.length === 0) {
      return sendError(res, 'Cart is empty.', 400);
    }

    if (!contactInfo?.firstName || !contactInfo?.email) {
      return sendError(res, 'First name and email are required for checkout.', 400);
    }

    // 1. Calculate items subtotal and tax
    let subtotal = 0;
    let taxTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, storeId: store._id }).populate('taxId');
      if (!product) continue;

      const itemPrice = product.salePrice !== null && product.salePrice > 0 ? product.salePrice : product.price;
      const quantity = Math.max(1, item.quantity || 1);
      const lineSubtotal = itemPrice * quantity;
      subtotal += lineSubtotal;

      let itemTaxRate = 0;
      let itemTaxName = '';
      if (product.taxId) {
        itemTaxRate = product.taxId.rate || 0;
        itemTaxName = product.taxId.name || 'Tax';
      }
      const itemTaxAmount = (lineSubtotal * itemTaxRate) / 100;
      taxTotal += itemTaxAmount;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        image: product.coverImage,
        price: itemPrice,
        quantity,
        selectedVariant: item.selectedVariant || null,
        taxName: itemTaxName,
        taxRate: itemTaxRate,
        taxAmount: itemTaxAmount,
        lineTotal: lineSubtotal + itemTaxAmount,
      });

      // Decrement stock & increment sold count
      product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
      product.soldCount = (product.soldCount || 0) + quantity;
      await product.save();
    }

    // 2. Shipping Cost
    let shippingCost = 0;
    let shippingName = 'Standard Shipping';
    if (shippingMethodId) {
      const shipping = await ShippingMethod.findById(shippingMethodId);
      if (shipping) {
        shippingCost = shipping.cost || 0;
        shippingName = shipping.name;
      }
    }

    // 3. Coupon Discount
    let discount = 0;
    if (couponCode) {
      const coupon = await StoreCoupon.findOne({
        storeId: store._id,
        code: couponCode.toUpperCase().trim(),
        status: 'active',
      });
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        coupon.totalSavings = (coupon.totalSavings || 0) + discount;
        await coupon.save();
      }
    }

    const total = Math.max(0, subtotal + taxTotal + shippingCost - discount);
    const orderNumber = `WS-${Date.now().toString(36).toUpperCase()}`;

    // 4. Create or update Customer record
    let customer = await Customer.findOne({ storeId: store._id, email: contactInfo.email.toLowerCase() });
    if (!customer) {
      customer = await Customer.create({
        companyId: store.companyId,
        storeId: store._id,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName || '',
        email: contactInfo.email.toLowerCase(),
        phone: contactInfo.phone || '',
        shippingAddress: {
          street: contactInfo.street || '',
          country: contactInfo.country || '',
          state: contactInfo.state || '',
          city: contactInfo.city || '',
          postalCode: contactInfo.postalCode || '',
        },
        totalOrders: 1,
        totalSpent: total,
        lastOrderAt: new Date(),
      });
    } else {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + total;
      customer.lastOrderAt = new Date();
      await customer.save();
    }

    // 5. Create Order
    const order = await Order.create({
      orderNumber,
      companyId: store.companyId,
      storeId: store._id,
      customerId: customer._id,
      customerName: `${contactInfo.firstName} ${contactInfo.lastName || ''}`.trim(),
      customerEmail: contactInfo.email.toLowerCase(),
      customerPhone: contactInfo.phone || '',
      items: processedItems,
      subtotal,
      taxTotal,
      shippingCost,
      discount,
      total,
      couponCode: couponCode || '',
      shippingMethodName: shippingName,
      shippingMethodId: shippingMethodId || null,
      shippingAddress: {
        street: contactInfo.street || '',
        country: contactInfo.country || '',
        state: contactInfo.state || '',
        city: contactInfo.city || '',
        postalCode: contactInfo.postalCode || '',
      },
      billingAddress: {
        street: contactInfo.street || '',
        country: contactInfo.country || '',
        state: contactInfo.state || '',
        city: contactInfo.city || '',
        postalCode: contactInfo.postalCode || '',
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' || paymentMethod === 'WhatsApp' || paymentMethod === 'Bank Transfer' ? 'pending' : 'paid',
      fulfillmentStatus: 'pending',
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date(),
          note: `Order placed via ${paymentMethod} on ${store.name}`,
          completed: true,
        },
      ],
      isGuest,
      notes,
    });

    // 6. Generate WhatsApp & Telegram message payload
    const messaging = await CompanyMessagingSettings.findOne({ companyId: store.companyId });
    const orderUrl = `${process.env.APP_URL || 'http://localhost:5173'}/store/${store.slug}/orders/${order.orderNumber}`;

    const formattedOrderData = {
      storeName: store.name,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      orderUrl,
      appName: 'WhatsStore',
    };

    const whatsappMessage = renderOrderMessage({
      template: messaging?.messageTemplate || '',
      itemFormat: messaging?.itemVariableFormat || '',
      orderData: formattedOrderData,
      items: processedItems,
      channel: 'whatsapp',
    });

    order.whatsappPayload = whatsappMessage;
    await order.save();

    // Generate WhatsApp direct chat link
    const targetPhone = messaging?.whatsappNumber || store.whatsappWidget?.phoneNumber || '';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const whatsappChatUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsappMessage)}`;

    // Dispatch async notifications if enabled
    if (messaging?.telegramEnabled && messaging?.telegramBotToken) {
      const telegramHtml = renderOrderMessage({
        template: messaging.messageTemplate,
        itemFormat: messaging.itemVariableFormat,
        orderData: formattedOrderData,
        items: processedItems,
        channel: 'telegram',
      });
      sendTelegramMessage({ companyId: store.companyId, messageHtml: telegramHtml });
    }

    if (messaging?.twilioEnabled && order.customerPhone) {
      sendTwilioSms({
        companyId: store.companyId,
        to: order.customerPhone,
        message: `Hi ${order.customerName}, your order #${order.orderNumber} ($${order.total.toFixed(2)}) has been placed successfully at ${store.name}! Track here: ${orderUrl}`,
      });
    }

    // Send customer order confirmation email
    sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderNumber} — ${store.name}`,
      html: `<h2>Thank you for your order!</h2><p>Your order #${order.orderNumber} for $${order.total.toFixed(2)} has been received.</p><p><a href="${orderUrl}">Click here to view your order details</a></p>`,
      companyId: store.companyId,
    });

    dispatchWebhook({
      companyId: store.companyId,
      module: 'orders',
      event: 'order.created',
      payload: { orderNumber: order.orderNumber, total: order.total, customer: order.customerName, itemsCount: processedItems.length },
    });

    return sendSuccess(
      res,
      {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.fulfillmentStatus,
          paymentStatus: order.paymentStatus,
          invoiceUrl: `/api/storefront/${store.slug}/orders/${order.orderNumber}/invoice`,
        },
        whatsappChatUrl,
        whatsappMessage,
      },
      'Order placed successfully!',
      201
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return sendError(res, error.message, 500);
  }
};

export const trackPublicOrder = async (req, res) => {
  try {
    const { slug, orderNumber } = req.params;
    const store = await Store.findOne({ slug });
    if (!store) return sendError(res, 'Store not found.', 404);

    const order = await Order.findOne({ storeId: store._id, orderNumber }).populate('shippingMethodId');
    if (!order) return sendError(res, 'Order not found with that order number.', 404);

    return sendSuccess(res, order);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const downloadPublicOrderInvoice = async (req, res) => {
  try {
    const { slug, orderNumber } = req.params;
    const store = await Store.findOne({ slug });
    if (!store) return sendError(res, 'Store not found.', 404);

    const order = await Order.findOne({ storeId: store._id, orderNumber });
    if (!order) return sendError(res, 'Order not found.', 404);

    generateOrderInvoicePDF(order, store, res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ==========================================
// Public Landing Page & Leads
// ==========================================
export const getPublicLandingPage = async (req, res) => {
  try {
    const config = await LandingPageConfig.findOne();
    return sendSuccess(res, config);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getPublicCustomPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await CustomPage.findOne({ slug, isActive: true });
    if (!page) return sendError(res, 'Page not found.', 404);
    return sendSuccess(res, page);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const subscribeNewsletterPublic = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 'Email address is required.', 400);

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.status = 'subscribed';
      await existing.save();
      return sendSuccess(res, null, 'You are already subscribed! Updated preference.');
    }

    await Subscriber.create({ email: email.toLowerCase() });
    return sendSuccess(res, null, 'Thank you for subscribing to our newsletter!', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const submitContactInquiryPublic = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return sendError(res, 'Name, email, and message are required.', 400);
    }

    const inquiry = await ContactInquiry.create({
      name,
      email: email.toLowerCase(),
      subject: subject || 'General Inquiry',
      message,
    });

    return sendSuccess(res, inquiry, 'Your message has been sent successfully. We will be in touch shortly.', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
