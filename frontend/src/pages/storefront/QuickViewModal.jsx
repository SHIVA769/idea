import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, X, Plus, Minus, Check, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Modal } from '../../components/common/Modal';

export const QuickViewModal = ({ isOpen, onClose, product, storeWhatsAppPhone }) => {
  const { addToCart, setIsDrawerOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState(product?.thumbnail || '');
  const [quantity, setQuantity] = useState(1);
  const firstVariant = product?.variants?.[0];
  const [selectedVariant, setSelectedVariant] = useState(firstVariant?.options?.[0] || '');
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentImage = selectedImage || product.thumbnail;
  const galleryImages = [product.thumbnail, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    addToCart(
      {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        price: product.salePrice > 0 ? product.salePrice : product.price,
        salePrice: product.salePrice,
        thumbnail: product.thumbnail,
        coverImage: product.coverImage || product.thumbnail,
        stockQuantity: product.stockQuantity,
        taxId: product.taxId,
      },
      quantity,
      selectedVariant || null
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      setIsDrawerOpen(true);
    }, 800);
  };

  const handleWhatsAppDirectOrder = () => {
    const cleanPhone = (storeWhatsAppPhone || '+14155552671').replace(/[^0-9]/g, '');
    const price = product.salePrice > 0 ? product.salePrice : product.price;
    const msg = `Hi! I want to order "${product.name}" (Qty: ${quantity}${selectedVariant ? `, Option: ${selectedVariant}` : ''}) for $${(price * quantity).toFixed(2)}.`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Quick View" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Left: Gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${
                    currentImage === img ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {product.categoryId?.name || 'In Stock'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{product.name}</h2>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                ${product.salePrice > 0 ? product.salePrice : product.price}
              </span>
              {product.salePrice > 0 && (
                <span className="text-sm text-slate-400 line-through font-mono">${product.price}</span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
              {product.description || product.richDescription || 'Premium high quality merchandise.'}
            </p>

            {/* Variants */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div key={variant.name}>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Select {variant.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(variant.options || []).map((option) => (
                          <button
                            key={`${variant.name}-${option}`}
                            type="button"
                            onClick={() => setSelectedVariant(option)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                              selectedVariant === option
                                ? 'bg-primary-50 text-primary-700 border-primary-500 dark:bg-primary-950 dark:text-primary-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-mono font-bold text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-transform active:scale-98 shadow-sm"
            >
              {added ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{added ? 'Added to Bag!' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleWhatsAppDirectOrder}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-transform active:scale-98 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct Order via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
