import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../../redux/slices/orderSlice';
import { Download, X, Check } from 'lucide-react';
import api from '../../services/api';

const STEPS = ['pending','confirmed','designing','printing','ready','shipped','delivered'];
const STYLE = {pending:'status-pending',confirmed:'status-confirmed',designing:'status-designing',printing:'status-printing',ready:'status-ready',shipped:'status-shipped',delivered:'status-delivered',cancelled:'status-cancelled'};

export default function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder({ id, reason: 'Cancelled by customer' }));
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${order.orderNumber}.pdf`; a.click();
    } catch { alert('Invoice not available yet'); }
  };

  if (loading || !order) return <div className="container-main py-10"><div className="card h-64 animate-pulse" /></div>;

  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div className="container-main py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link to="/dashboard/orders" className="text-sm text-gray-400 hover:text-primary mb-1 block">← Back to Orders</Link>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            Order #{order.orderNumber}
            <span className={STYLE[order.status] || 'badge badge-gray'}>{order.status}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          {order.paymentStatus === 'completed' && (
            <button onClick={handleDownloadInvoice} className="btn btn-secondary text-sm gap-1.5"><Download size={15}/>Invoice</button>
          )}
          {['pending','confirmed'].includes(order.status) && (
            <button onClick={handleCancel} className="btn btn-danger text-sm gap-1.5"><X size={15}/>Cancel</button>
          )}
        </div>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all" style={{ width: `${(stepIdx / (STEPS.length-1)) * 100}%` }} />
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < stepIdx ? 'bg-primary text-white' : i === stepIdx ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {i < stepIdx ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-[10px] text-gray-500 capitalize hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item._id} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                </div>
                <p className="text-sm font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-1.5 text-sm">
            {[['Subtotal', `₹${order.subtotal?.toLocaleString('en-IN')}`],['Shipping', `₹${order.shippingCharge}`],['GST', `₹${order.gstTotal?.toFixed(0)}`],
              ...(order.couponDiscount>0 ? [['Coupon Discount', `-₹${order.couponDiscount}`]] : [])].map(([l,v]) => (
              <div key={l} className="flex justify-between text-gray-500"><span>{l}</span><span>{v}</span></div>
            ))}
            <div className="flex justify-between font-bold text-base pt-1.5 border-t border-gray-100 dark:border-gray-800">
              <span>Total</span><span className="text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="space-y-4">
          {order.shippingAddress && (
            <div className="card p-5">
              <h2 className="font-semibold mb-3">Delivery Address</h2>
              <p className="font-medium text-sm">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p className="text-sm text-gray-500">{order.shippingAddress.addressLine2}</p>}
              <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-sm text-gray-500">📞 {order.shippingAddress.mobile}</p>
            </div>
          )}
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Payment Info</h2>
            <div className="space-y-2 text-sm">
              {[['Method', order.paymentMethod?.toUpperCase()],['Status', order.paymentStatus],
                ...(order.trackingNumber ? [['Tracking', order.trackingNumber],['Courier', order.courierPartner]] : [])].map(([l,v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-gray-500">{l}</span><span className="font-medium capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
