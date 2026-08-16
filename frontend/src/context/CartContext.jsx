import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [currentStoreSlug, setCurrentStoreSlug] = useState('');

  // Load cart from localStorage for store slug
  const initStoreCart = (slug) => {
    setCurrentStoreSlug(slug);
    try {
      const stored = localStorage.getItem(`ws_cart_${slug}`);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    if (currentStoreSlug) {
      localStorage.setItem(`ws_cart_${currentStoreSlug}`, JSON.stringify(items));
    }
  }, [items, currentStoreSlug]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setItems((prev) => {
      const variantKey = selectedVariant ? JSON.stringify(selectedVariant) : 'standard';
      const existingIdx = prev.findIndex(
        (i) => i.productId === product._id && JSON.stringify(i.selectedVariant) === JSON.stringify(selectedVariant)
      );

      const unitPrice = product.salePrice !== null && product.salePrice > 0 ? product.salePrice : product.price;

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku,
          image: product.coverImage,
          price: unitPrice,
          taxRate: product.taxId?.rate || 0,
          taxName: product.taxId?.name || '',
          quantity,
          selectedVariant,
          stockQuantity: product.stockQuantity,
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const updateQuantity = (productId, selectedVariant, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, selectedVariant) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setSelectedShippingMethod(null);
    if (currentStoreSlug) {
      localStorage.removeItem(`ws_cart_${currentStoreSlug}`);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxTotal = items.reduce((acc, item) => acc + (item.price * item.quantity * (item.taxRate || 0)) / 100, 0);
  const shippingCost = selectedShippingMethod?.cost || 0;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const finalTotal = Math.max(0, subtotal + taxTotal + shippingCost - discountAmount);
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCouponCode = async (slug, code) => {
    try {
      const res = await api.post(`/storefront/${slug}/coupon/apply`, { code, subtotal });
      if (res.data?.success) {
        setAppliedCoupon(res.data.data);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to apply coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        setIsDrawerOpen,
        initStoreCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        selectedShippingMethod,
        setSelectedShippingMethod,
        subtotal,
        taxTotal,
        shippingCost,
        discountAmount,
        finalTotal,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
