import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = {code:'',description:'',discountType:'percentage',discountValue:'',maxDiscountAmount:'',minOrderValue:'',usageLimit:'',perUserLimit:1,startDate:'',endDate:'',isActive:true};
  const [form, setForm] = useState(blank);

  const load = async () => { try { const {data}=await api.get('/coupons'); setCoupons(data.data.coupons); } catch{toast.error('Failed');} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);

  const save = async () => {
    setSaving(true);
    try { await api.post('/coupons', form); toast.success('Created!'); setShowForm(false); setForm(blank); load(); }
    catch(e){toast.error(e.response?.data?.message||'Failed');} finally{setSaving(false);}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Coupons</h1>
        <button onClick={()=>setShowForm(true)} className="btn btn-primary text-sm gap-1.5"><Plus size={16}/>Create</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Coupon</h2>
            <div className="space-y-3">
              {[['code','Code (e.g. SAVE20)','text'],['description','Description','text'],['discountValue','Discount Value','number'],['maxDiscountAmount','Max Discount (₹)','number'],['minOrderValue','Min Order (₹)','number'],['usageLimit','Usage Limit','number']].map(([k,l,t])=>(
                <div key={k}><label className="block text-xs text-gray-400 mb-1">{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:k==='code'?e.target.value.toUpperCase():e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Type</label>
                  <select value={form.discountType} onChange={e=>setForm(f=>({...f,discountType:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="percentage">Percentage (%)</option><option value="flat">Flat (₹)</option>
                  </select></div>
                <div><label className="block text-xs text-gray-400 mb-1">Per User Limit</label>
                  <input type="number" value={form.perUserLimit} onChange={e=>setForm(f=>({...f,perUserLimit:parseInt(e.target.value)}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['startDate','Start Date'],['endDate','End Date']].map(([k,l])=>(
                  <div key={k}><label className="block text-xs text-gray-400 mb-1">{l}</label>
                    <input type="date" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} className="accent-primary"/>
                <span className="text-sm text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn btn-primary flex-1">{saving?'Saving...':'Create'}</button>
              <button onClick={()=>setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <div className="text-center text-gray-500 py-12">Loading...</div> :
      coupons.length===0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><Tag size={32} className="mx-auto mb-3 text-gray-600"/><p className="text-gray-500">No coupons yet.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c=>{
            const exp = new Date(c.endDate)<new Date();
            return (
              <div key={c._id} className={`bg-gray-900 border rounded-xl p-5 relative group ${exp||!c.isActive?'border-gray-800 opacity-60':'border-gray-700'}`}>
                <button onClick={async()=>{if(window.confirm('Delete?')){await api.delete('/coupons/'+c._id);toast.success('Deleted');load();}}} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-red-900/30 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13}/></button>
                <p className="font-mono font-bold text-primary text-lg mb-1">{c.code}</p>
                <p className="text-gray-400 text-xs mb-3">{c.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-white font-semibold">{c.discountType==='percentage'?`${c.discountValue}%`:`₹${c.discountValue}`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Used</span><span className="text-white">{c.usedCount}/{c.usageLimit||'∞'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className={exp?'text-red-400':'text-white'}>{new Date(c.endDate).toLocaleDateString('en-IN')}</span></div>
                </div>
                <span className={`mt-3 block text-[10px] px-2 py-0.5 rounded-full font-medium uppercase w-fit ${!c.isActive||exp?'bg-gray-800 text-gray-500':'bg-green-900/50 text-green-400'}`}>{!c.isActive?'inactive':exp?'expired':'active'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
