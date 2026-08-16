import { THEME_REGISTRY } from '../themes/themeRegistry';

export const STORE_THEMES = Object.values(THEME_REGISTRY).map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  tagline: t.tagline,
  bannerImage: t.bannerImage,
}));

export const DEFAULT_THEME = 'theme-home-decor';

export const EMAIL_TEMPLATE_VARS = [
  { var: '{app_name}', label: 'App Name' },
  { var: '{company_name}', label: 'Company Name' },
  { var: '{store_name}', label: 'Store Name' },
  { var: '{order_name}', label: 'Order Number' },
  { var: '{customer_name}', label: 'Customer Name' },
  { var: '{order_url}', label: 'Order Link' },
  { var: '{final_total}', label: 'Order Total' },
];

export const NOTIFICATION_TEMPLATE_VARS = [
  { var: '{company_name}', label: 'Company Name' },
  { var: '{store_name}', label: 'Store Name' },
  { var: '{order_number}', label: 'Order Number' },
  { var: '{customer_name}', label: 'Customer Name' },
  { var: '{total_amount}', label: 'Total Amount' },
];

export const WHATSAPP_VARIABLES = [
  { var: '{store_name}', label: 'Store Name' },
  { var: '{order_no}', label: 'Order Number' },
  { var: '{customer_name}', label: 'Customer Name' },
  { var: '{shipping_address}', label: 'Shipping Street' },
  { var: '{shipping_country}', label: 'Country' },
  { var: '{shipping_city}', label: 'City' },
  { var: '{shipping_postalcode}', label: 'Postal Code' },
  { var: '{item_variable}', label: 'Item Level List' },
  { var: '{qty_total}', label: 'Total Items Qty' },
  { var: '{sub_total}', label: 'Subtotal' },
  { var: '{discount_amount}', label: 'Discount' },
  { var: '{shipping_amount}', label: 'Shipping Fee' },
  { var: '{total_tax}', label: 'Tax' },
  { var: '{final_total}', label: 'Final Total' },
];

export const ITEM_VARIABLES = [
  { var: '{sku}', label: 'SKU' },
  { var: '{quantity}', label: 'Quantity' },
  { var: '{product_name}', label: 'Product Name' },
  { var: '{variant_name}', label: 'Variant' },
  { var: '{item_tax}', label: 'Item Tax' },
  { var: '{item_total}', label: 'Item Line Total' },
];

export const PERMISSION_MODULES = {
  dashboard: { name: 'Dashboard', actions: ['view'] },
  analytics: { name: 'Analytics', actions: ['view'] },
  users: { name: 'Users & Staff', actions: ['view', 'create', 'edit', 'delete'] },
  roles: { name: 'Roles', actions: ['view', 'create', 'edit', 'delete'] },
  plans: { name: 'Plans', actions: ['view', 'subscribe'] },
  stores: { name: 'Stores', actions: ['view', 'create', 'edit', 'delete'] },
  products: { name: 'Products', actions: ['view', 'create', 'edit', 'delete'] },
  categories: { name: 'Categories', actions: ['view', 'create', 'edit', 'delete'] },
  tax: { name: 'Tax', actions: ['view', 'create', 'edit', 'delete'] },
  orders: { name: 'Orders', actions: ['view', 'edit', 'delete'] },
  customers: { name: 'Customers', actions: ['view', 'create', 'edit', 'delete'] },
  coupons: { name: 'Coupons', actions: ['view', 'create', 'edit', 'delete'] },
  shipping: { name: 'Shipping', actions: ['view', 'create', 'edit', 'delete'] },
  settings: { name: 'Settings', actions: ['view', 'edit'] },
  referral: { name: 'Referral', actions: ['view', 'request_payout'] },
  media: { name: 'Media Library', actions: ['view', 'upload', 'delete'] },
};
