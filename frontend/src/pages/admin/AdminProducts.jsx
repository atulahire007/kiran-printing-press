import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({name:'',basePrice:'',discountPrice:'',category:'',sku:'',gstRate:18,stock:100,status:'active',isFeatured:false,description:''});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = { page, limit:15, ...(search && {q:search}) };
      const { data } = await api.get('/products?'+new URLSearchParams(p));
      setProducts(data.data.products); setPagination(data.data.pagination);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[page,search]);
  useEffect(()=>{ api.get('/categories').then(r=>setCategories(r.data.data.categories)); },[]);

  const save = async () => {
    setSaving(true);
    try {
      editing ? await api.put('/products/'+editing, form) : await api.post('/products', form);
      toast.success(editing?'Updated':'Created');
      setShowForm(false); setEditing(null); load();
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); } finally { setSaving(false); }
  };

  const del = async (id, name) => {
    if(!window.confirm('Delete "'+name+'"?')) return;
    try { await api.delete('/products/'+id); toast.success('Deleted'); load(); }
    catch(e){ toast.error(e.response?.data?.message||'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Products</h1>
        <button onClick={()=>{setShowForm(true);setEditing(null);setForm({name:'',basePrice:'',discountPrice:'',category:'',sku:'',gstRate:18,stock:100,status:'active',isFeatured:false,description:''}); }} className="btn btn-primary text-sm gap-1.5"><Plus size={16}/>Add</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editing?'Edit':'Add'} Product</h2>
            <div className="space-y-3">
              {[['name','Name','text'],['sku','SKU','text'],['basePrice','Base Price','number'],['discountPrice','Discount Price','number'],['stock','Stock','number']].map(([k,l,t])=>(
                <div key={k}><label className="block text-xs text-gray-400 mb-1">{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              ))}
              <div><label className="block text-xs text-gray-400 mb-1">Category</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">Select</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">GST</label>
                  <select value={form.gstRate} onChange={e=>setForm(f=>({...f,gstRate:parseInt(e.target.value)}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {[0,5,12,18,28].map(r=><option key={r} value={r}>{r}%</option>)}
                  </select></div>
                <div><label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {['active','inactive','draft'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"/></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} className="accent-primary"/>
                <span className="text-sm text-gray-300">Featured Product</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn btn-primary flex-1">{saving?'Saving...':editing?'Update':'Create'}</button>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"/>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> :
        products.length===0 ? <div className="p-12 text-center text-gray-500">No products</div> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              {['Product','Category','Price','Stock','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {products.map(p=>(
                <tr key={p._id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                      {p.images?.[0]?.url&&<img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover"/>}
                    </div>
                    <div><p className="text-white text-xs font-medium max-w-[140px] truncate">{p.name}</p><p className="text-gray-500 text-[10px]">{p.sku}</p></div>
                  </div></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.category?.name}</td>
                  <td className="px-4 py-3"><p className="text-primary font-semibold text-xs">₹{(p.discountPrice||p.basePrice)?.toLocaleString('en-IN')}</p></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium ${p.stock>10?'text-green-400':p.stock>0?'text-yellow-400':'text-red-400'}`}>{p.stock>99999?'∞':p.stock}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${p.status==='active'?'bg-green-900/50 text-green-400':p.status==='draft'?'bg-yellow-900/50 text-yellow-400':'bg-red-900/50 text-red-400'}`}>{p.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-1.5">
                    <button onClick={()=>{setEditing(p._id);setForm({name:p.name,basePrice:p.basePrice,discountPrice:p.discountPrice||'',category:p.category?._id||'',sku:p.sku,gstRate:p.gstRate,stock:p.stock,status:p.status,isFeatured:p.isFeatured,description:p.description});setShowForm(true);}} className="w-7 h-7 flex items-center justify-center bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50"><Edit2 size={13}/></button>
                    <button onClick={()=>del(p._id,p.name)} className="w-7 h-7 flex items-center justify-center bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"><Trash2 size={13}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        {pagination?.pages>1&&(
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">{pagination.total} products</p>
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
