import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['all','pending','confirmed','designing','printing','ready','shipped','delivered','cancelled'];
const STYLE = {pending:'status-pending',confirmed:'status-confirmed',designing:'status-designing',printing:'status-printing',ready:'status-ready',shipped:'status-shipped',delivered:'status-delivered',cancelled:'status-cancelled'};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ status:'all', page:1, search:'' });
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const p = { page: filters.page, limit: 20 };
      if (filters.status !== 'all') p.status = filters.status;
      if (filters.search) p.search = filters.search;
      const { data } = await api.get('/orders/admin/all?' + new URLSearchParams(p).toString());
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters.status, filters.page]);

  const update = async (id) => {
    if (!newStatus) return;
    setUpdating(id);
    try {
      await api.put('/orders/' + id + '/status', { status: newStatus });
      toast.success('Status updated');
      setSelected(null); setNewStatus(''); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Orders</h1>
        <button onClick={load} className="btn btn-secondary btn-sm gap-1.5 text-xs"><RefreshCw size={14}/>Refresh</button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value,page:1}))}
            placeholder="Search order..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>setFilters(f=>({...f,status:s,page:1}))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filters.status===s?'bg-primary text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500"><RefreshCw size={24} className="mx-auto mb-2 animate-spin"/>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-800">
                {['Order #','Customer','Items','Total','Payment','Status','Date','Action'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map(o=>(
                  <tr key={o._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">{o.orderNumber}</td>
                    <td className="px-4 py-3"><p className="text-white text-xs font-medium">{o.user?.name}</p><p className="text-gray-500 text-[10px]">{o.user?.mobile}</p></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{o.items?.length}</td>
                    <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.paymentStatus==='completed'?'bg-green-900/50 text-green-400':'bg-yellow-900/50 text-yellow-400'}`}>{o.paymentStatus}</span></td>
                    <td className="px-4 py-3"><span className={STYLE[o.status]||'badge badge-gray'}>{o.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {selected===o._id ? (
                        <div className="flex items-center gap-1">
                          <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className="bg-gray-800 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-primary">
                            <option value="">Pick...</option>
                            {['confirmed','designing','printing','ready','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                          <button onClick={()=>update(o._id)} disabled={!newStatus||updating===o._id} className="px-2 py-1 bg-primary text-white text-xs rounded disabled:opacity-50">{updating===o._id?'...':'OK'}</button>
                          <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-white text-xs px-1">✕</button>
                        </div>
                      ) : (
                        <button onClick={()=>{setSelected(o._id);setNewStatus('');}} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded hover:bg-gray-700">Update</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination?.pages>1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">{pagination.total} total</p>
            <div className="flex gap-1.5">
              <button disabled={filters.page<=1} onClick={()=>setFilters(f=>({...f,page:f.page-1}))} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-gray-400 text-xs">{filters.page}/{pagination.pages}</span>
              <button disabled={filters.page>=pagination.pages} onClick={()=>setFilters(f=>({...f,page:f.page+1}))} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
