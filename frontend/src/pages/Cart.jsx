// ══════════════════════════════════════════
// Cart.jsx
// ══════════════════════════════════════════
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { updateCartItem, removeCartItem, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import { useState } from 'react';

export function Cart() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items, couponDiscount, loading } = useSelector((s) => s.cart);
  const [couponInput, setCouponInput] = useState('');

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const gstTotal = items.reduce((s, i) => {
    const gstRate = i.product?.gstRate || 18;
    return s + (i.unitPrice * i.quantity * gstRate) / 100;
  }, 0);
  const total = subtotal + shipping + gstTotal - couponDiscount;

  if (items.length === 0) return (
    <div className="container-main py-20 text-center">
      <div className="max-w-md mx-auto card p-12">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-5" />
        <h2 className="text-2xl font-display font-bold mb-3">{t('cart.empty')}</h2>
        <p className="text-gray-500 mb-6">{t('cart.empty_desc')}</p>
        <Link to="/products" className="btn btn-primary btn-lg">{t('cart.continue_shopping')}</Link>
      </div>
    </div>
  );

  return (
    <div className="container-main py-10">
      <h1 className="page-title mb-8">{t('cart.title')}</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.product?.slug}`} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-50">
                <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${item.product?.slug}`} className="font-medium text-sm text-ink dark:text-white hover:text-primary line-clamp-2">
                    {item.name}
                  </Link>
                  <button onClick={() => dispatch(removeCartItem(item._id))} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                {item.customization?.paperSize && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.customization.paperSize} · {item.customization.colorOption}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-primary">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <p className="font-semibold text-sm mb-3 flex items-center gap-2"><Tag size={16} className="text-primary" />{t('cart.apply_coupon')}</p>
            {couponDiscount > 0 ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <span className="text-green-700 dark:text-green-400 text-sm font-medium">Coupon applied! -₹{couponDiscount}</span>
                <button onClick={() => dispatch(removeCoupon())} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder={t('cart.coupon_placeholder')} className="input flex-1 text-sm py-2 uppercase" />
                <button onClick={() => { dispatch(applyCoupon(couponInput)); setCouponInput(''); }}
                  disabled={!couponInput} className="btn btn-primary text-sm">
                  {t('cart.apply')}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-bold text-lg">{t('checkout.order_summary')}</h3>
            <div className="space-y-2 text-sm">
              {[
                [t('cart.subtotal'), `₹${subtotal.toLocaleString('en-IN')}`],
                ['GST', `₹${gstTotal.toFixed(0)}`],
                [t('cart.shipping'), shipping === 0 ? <span className="text-green-600 font-medium">{t('cart.free_shipping')}</span> : `₹${shipping}`],
                ...(couponDiscount > 0 ? [[t('cart.coupon_discount'), <span className="text-green-600">-₹{couponDiscount}</span>]] : []),
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg">
                <span>{t('cart.total')}</span>
                <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn btn-primary w-full btn-lg btn-shine">
              {t('cart.checkout')} <ArrowRight size={18} />
            </Link>
            <p className="text-xs text-center text-gray-400">{t('cart.free_shipping_above')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Cart;
