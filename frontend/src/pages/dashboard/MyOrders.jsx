import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import { Package, ChevronRight } from 'lucide-react';

const STATUS_STYLES = {
  pending:'status-pending', confirmed:'status-confirmed', designing:'status-designing',
  printing:'status-printing', ready:'status-ready', shipped:'status-shipped',
  delivered:'status-delivered', cancelled:'status-cancelled'
};

export default function MyOrders() {
  const dispatch = useDispatch();
  const { list: orders, loading, pagination } = useSelector((s) => s.orders);
  const [page, setPage] = useState(1);

  useEffect(() => { dispatch(fetchMyOrders({ page })); }, [dispatch, page]);

  if (loading) return (
    <div className="container-main py-10 max-w-4xl space-y-4">
      {[...Array(3)].map((_,i) => <div key={i} className="card h-24 animate-pulse" />)}
    </div>
  );

  return (
    <div className="container-main py-10 max-w-4xl">
      <h1 className="page-title mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/dashboard/orders/${order._id}`}
              className="card p-5 hover:border-primary/20 transition-colors group block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-ink dark:text-white">#{order.orderNumber}</span>
                    <span className={STATUS_STYLES[order.status] || 'badge badge-gray'}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.items?.length} item(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </div>
              {order.items?.slice(0,2).map(item => (
                <div key={item._id} className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.name} × {item.quantity}</p>
                </div>
              ))}
            </Link>
          ))}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="btn btn-secondary btn-sm">← Prev</button>
              <span className="btn btn-ghost text-sm">{page} / {pagination.pages}</span>
              <button disabled={page>=pagination.pages} onClick={() => setPage(p=>p+1)} className="btn btn-secondary btn-sm">Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
