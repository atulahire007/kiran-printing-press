import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CreditCard, Smartphone, Truck, MapPin, Plus, Check } from 'lucide-react';
import { placeOrder, createRazorpayOrder } from '../redux/slices/orderSlice';
import { clearCartLocal } from '../redux/slices/cartSlice';
import { initiateRazorpayPayment } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Pay Online (Card/UPI/Netbanking)', icon: <CreditCard size={20} />, badge: 'Recommended' },
  { id: 'upi', label: 'UPI Direct', icon: <Smartphone size={20} /> },
  { id: 'cod', label: 'Cash on Delivery', icon: <Truck size={20} />, note: '+₹25 COD charge' },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  const { items, couponDiscount } = useSelector((s) => s.cart);
  const { placing } = useSelector((s) => s.orders);

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.find(a => a.isDefault)?._id || user?.addresses?.[0]?._id);
  const [showAddressForm, setShowAddressForm] = useState(!user?.addresses?.length);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const gstTotal = items.reduce((s, i) => s + (i.unitPrice * i.quantity * (i.product?.gstRate || 18)) / 100, 0);
  const total = subtotal + shipping + gstTotal - couponDiscount + (paymentMethod === 'cod' ? 25 : 0);

  const getShippingAddress = (formData) => {
    if (selectedAddress && !showAddressForm) {
      return user.addresses.find(a => a._id === selectedAddress);
    }
    return formData;
  };

  const onSubmit = async (formData) => {
    const address = getShippingAddress(formData);
    if (!address) { toast.error('Please select a delivery address'); return; }

    const orderPayload = {
      items: items.map(i => ({
        product: i.product._id || i.product,
        quantity: i.quantity,
        customization: i.customization,
        designFile: i.designFile,
      })),
      shippingAddress: address,
      paymentMethod,
    };

    if (paymentMethod === 'cod') {
      const result = await dispatch(placeOrder(orderPayload));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(clearCartLocal());
        navigate(`/order-success/${result.payload._id}`);
      }
      return;
    }

    // Razorpay / UPI flow
    try {
      // 1. Create order on backend
      const orderResult = await dispatch(placeOrder(orderPayload));
      if (orderResult.meta.requestStatus !== 'fulfilled') return;
      const createdOrder = orderResult.payload;

      // 2. Create Razorpay order
      const rzpResult = await dispatch(createRazorpayOrder({
        amount: total, orderId: createdOrder._id
      }));
      if (rzpResult.meta.requestStatus !== 'fulfilled') return;
      const rzpOrder = rzpResult.payload;

      // 3. Open Razorpay checkout
      await initiateRazorpayPayment({
        order: rzpOrder,
        user,
        onSuccess: async (response) => {
          await api.post('/orders/razorpay/verify', {
            ...response,
            orderId: createdOrder._id,
          });
          dispatch(clearCartLocal());
          navigate(`/order-success/${createdOrder._id}`);
        },
        onFailure: (msg) => toast.error(msg || 'Payment failed'),
      });
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="container-main py-10">
      <h1 className="page-title mb-8">{t('checkout.title')}</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> {t('checkout.shipping_address')}
              </h2>

              {/* Saved addresses */}
              {user?.addresses?.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {user.addresses.map(addr => (
                    <label key={addr._id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedAddress === addr._id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="address" value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="mt-0.5 accent-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{addr.name}</span>
                          <span className="badge badge-gray capitalize">{addr.addressType}</span>
                          {addr.isDefault && <span className="badge badge-green">Default</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500">📞 {addr.mobile}</p>
                      </div>
                      {selectedAddress === addr._id && <Check size={18} className="text-primary shrink-0 mt-0.5" />}
                    </label>
                  ))}
                  <button type="button" onClick={() => setShowAddressForm(true)}
                    className="btn btn-secondary w-full text-sm gap-2">
                    <Plus size={16} /> {t('checkout.add_new_address')}
                  </button>
                </div>
              )}

              {/* Address form */}
              {showAddressForm && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: 'name', label: 'Full Name', required: true },
                      { name: 'mobile', label: 'Mobile Number', required: true },
                    ].map(({ name, label, required }) => (
                      <div key={name} className="form-group">
                        <label className="label">{label}</label>
                        <input {...register(name, { required: required && 'Required' })}
                          className={`input ${errors[name] ? 'input-error' : ''}`} />
                        {errors[name] && <p className="text-xs text-red-500">{errors[name].message}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="label">Address Line 1</label>
                    <input {...register('addressLine1', { required: 'Required' })}
                      className={`input ${errors.addressLine1 ? 'input-error' : ''}`} />
                  </div>
                  <div className="form-group">
                    <label className="label">Address Line 2 <span className="text-gray-400 text-xs">(Optional)</span></label>
                    <input {...register('addressLine2')} className="input" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { name: 'city', label: 'City', required: true },
                      { name: 'district', label: 'District', required: true },
                      { name: 'pincode', label: 'Pincode', required: true },
                    ].map(({ name, label, required }) => (
                      <div key={name} className="form-group">
                        <label className="label">{label}</label>
                        <input {...register(name, { required: required && 'Required' })}
                          className={`input ${errors[name] ? 'input-error' : ''}`} />
                      </div>
                    ))}
                  </div>
                  <div className="form-group">
                    <label className="label">State</label>
                    <input {...register('state')} defaultValue="Maharashtra" className="input" />
                  </div>
                  {user?.addresses?.length > 0 && (
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-ghost text-sm">
                      ← Use saved address
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> {t('checkout.payment_method')}
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, icon, badge, note }) => (
                  <label key={id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="payment" value={id}
                      checked={paymentMethod === id}
                      onChange={() => setPaymentMethod(id)}
                      className="accent-primary" />
                    <span className={paymentMethod === id ? 'text-primary' : 'text-gray-500'}>{icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{label}</span>
                      {note && <span className="text-xs text-gray-400 ml-2">{note}</span>}
                    </div>
                    {badge && <span className="badge badge-green text-xs">{badge}</span>}
                    {paymentMethod === id && <Check size={18} className="text-primary" />}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-5 sticky top-24 space-y-3">
              <h3 className="font-display font-bold text-lg">{t('checkout.order_summary')}</h3>

              {/* Items list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.product?.images?.[0]?.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2 text-sm">
                {[
                  ['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
                  ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
                  ['GST', `₹${gstTotal.toFixed(0)}`],
                  ...(couponDiscount > 0 ? [['Coupon', `-₹${couponDiscount}`]] : []),
                  ...(paymentMethod === 'cod' ? [['COD Fee', '₹25']] : []),
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-gray-500">
                    <span>{l}</span><span>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button type="submit" disabled={placing || !items.length}
                className="btn btn-primary w-full btn-lg btn-shine mt-2">
                {placing ? 'Processing...' : t('checkout.place_order')}
              </button>
              <p className="text-xs text-center text-gray-400">🔒 Secure checkout powered by Razorpay</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
