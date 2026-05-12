import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const p = { page, limit:20, ...(search&&{search}) };
      const { data } = await api.get('/admin/users?'+new URLSearchParams(p));
      setUsers(data.data.users); setPagination(data.data.pagination);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[page]);

  const toggleBlock = async (id, isBlocked) => {
    try {
      await api.put('/admin/users/'+id+'/block', { isBlocked: !isBlocked });
      toast.success(isBlocked?'User unblocked':'User blocked');
      load();
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-display font-bold text-white">Users</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search users..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"/>
        </div>
        <button onClick={load} className="btn btn-secondary text-sm">Search</button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
        users.length===0 ? <div className="p-12 text-center text-gray-500">No users</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              {['User','Email','Mobile','Role','Orders','Status','Action'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u=>(
                <tr key={u._id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">{u.name?.[0]}</div><span className="text-white text-xs font-medium">{u.name}</span></div></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.mobile||'—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${u.role==='superadmin'?'bg-purple-900/50 text-purple-400':u.role==='admin'?'bg-blue-900/50 text-blue-400':'bg-gray-800 text-gray-400'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.orderCount||0}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isBlocked?'bg-red-900/50 text-red-400':'bg-green-900/50 text-green-400'}`}>{u.isBlocked?'Blocked':'Active'}</span></td>
                  <td className="px-4 py-3">
                    {u.role==='user'&&(
                      <button onClick={()=>toggleBlock(u._id,u.isBlocked)} className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${u.isBlocked?'bg-green-900/30 text-green-400 hover:bg-green-900/50':'bg-red-900/30 text-red-400 hover:bg-red-900/50'}`}>
                        {u.isBlocked?<CheckCircle size={13}/>:<Ban size={13}/>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        {pagination?.pages>1&&(
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">{pagination.total} users</p>
            <div className="flex gap-1.5">
              <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1.5 text-gray-400 text-xs">{page}/{pagination.pages}</span>
              <button disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1.5 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
