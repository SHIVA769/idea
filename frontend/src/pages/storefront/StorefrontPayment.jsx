import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { CheckCircle2, Clock3, Copy, QrCode, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';

const PAYMENT_SECONDS = 10 * 60;

export const StorefrontPayment = () => {
  const { slug, orderNumber } = useParams();
  const { storeData, themeConfig } = useOutletContext();
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const paymentSettings = location.state?.paymentSettings || storeData?.paymentSettings;
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_SECONDS);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatTime = () => `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const upiValue = `upi://pay?pa=${encodeURIComponent(paymentSettings?.upiId || '')}&pn=${encodeURIComponent(paymentSettings?.accountName || storeData?.name || '')}&am=${encodeURIComponent(Number(order?.total || 0).toFixed(2))}&cu=INR`;

  const confirmPayment = async () => {
    if (!order || secondsLeft === 0) return;
    setIsConfirming(true);
    setErrorMessage('');
    try {
      await api.post(`/storefront/${slug}/orders/${orderNumber}/payment-confirmation`);
      clearCart();
      navigate(`/store/${slug}/order-success/${orderNumber}`, {
        state: { order: { ...order, paymentStatus: 'paid' }, whatsappChatUrl: location.state?.whatsappChatUrl },
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Payment confirmation failed. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!order || !paymentSettings?.upiId) {
    return <div className="max-w-md mx-auto py-20 text-center space-y-4"><h1 className="text-xl font-bold">Payment session unavailable</h1><Link to={`/store/${slug}`} className={themeConfig.primaryBtn}>Return to Store</Link></div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><QrCode className="w-7 h-7" /></div>
        <h1 className={`text-2xl font-black ${themeConfig.fontHeading}`}>Complete UPI Payment</h1>
        <p className="text-sm text-slate-500">Scan the QR code with your UPI app, then confirm your payment below.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-sm"><Clock3 className="w-4 h-4" /> QR expires in {formatTime()}</div>
        <div className="mx-auto w-56 h-56 p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-center">
          {paymentSettings.qrCodeImage ? (
            <img src={paymentSettings.qrCodeImage} alt="UPI payment QR code" className="w-full h-full object-contain" />
          ) : (
            <QRCodeSVG value={upiValue} size={196} level="H" includeMargin />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Pay to {paymentSettings.accountName || storeData?.name}</p>
          <div className="flex items-center justify-center gap-2"><span className="font-mono font-bold text-slate-900">{paymentSettings.upiId}</span><button type="button" title="Copy UPI ID" onClick={() => navigator.clipboard?.writeText(paymentSettings.upiId)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Copy className="w-3.5 h-3.5" /></button></div>
          <p className="text-2xl font-black text-slate-900">₹{Number(order.total || 0).toFixed(2)}</p>
          <p className="text-[11px] text-slate-400">Order #{orderNumber}</p>
        </div>
        {errorMessage && <p className="text-xs text-rose-600">{errorMessage}</p>}
        <button type="button" disabled={isConfirming || secondsLeft === 0} onClick={confirmPayment} className={`w-full py-3 rounded-xl text-sm font-bold text-white ${themeConfig.primaryBtn} disabled:opacity-50`}>
          {isConfirming ? 'Confirming Payment...' : secondsLeft === 0 ? 'Payment Session Expired' : 'I Have Paid, Confirm Order'}
        </button>
        <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Payment remains subject to merchant verification.</p>
      </div>
      <Link to={`/store/${slug}/checkout`} className="text-xs font-bold text-slate-500 hover:underline">Back to checkout</Link>
    </div>
  );
};