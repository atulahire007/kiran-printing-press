import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({title:'',subtitle:'',link:'',buttonText:'Shop Now',position:'hero',isActive:true,sortOrder:0,'image.url':''});
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => { try { const {data}=await api.get('/banners'); setBanners(data.data.banners); } catch{} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, image: { url: form['image.url'], public_id: 'manual' } };
    try {
      editing ? await api.put('/banners/'+editing,payload) : await api.post('/banners',payload);
      toast.success(editing?'Updated':'Created'); setShowForm(false); setEditing(null); load();
    } catch(e){toast.error(e.response?.data?.message||'Failed');} finally{setSaving(false);}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Banners</h1>
        <button onClick={()=>{setShowForm(true);setEditing(null);setForm({title:'',subtitle:'',link:'',buttonText:'Shop Now',position:'hero',isActive:true,sortOrder:0,'image.url':''});}} className="btn btn-primary text-sm gap-1.5"><Plus size={16}/>Add Banner</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editing?'Edit':'Add'} Banner</h2>
            <div className="space-y-3">
              {[['title','Title'],['subtitle','Subtitle'],['link','Link URL'],['buttonText','Button Text'],['image.url','Image URL']].map(([k,l])=>(
                <div key={k}><label className="block text-xs text-gray-400 mb-1">{l}</label>
                  <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Position</label>
                  <select value={form.position} onChange={e=>setForm(f=>({...f,position:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {['hero','middle','bottom','sidebar','popup'].map(p=><option key={p} value={p}>{p}</option>)}
                  </select></div>
                <div><label className="block text-xs text-gray-400 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:parseInt(e.target.value)}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} className="accent-primary"/><span className="text-sm text-gray-300">Active</span></label>
              {form['image.url'] && <img src={form['image.url']} alt="preview" className="w-full h-24 object-cover rounded-lg"/>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn btn-primary flex-1">{saving?'Saving...':editing?'Update':'Create'}</button>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {loading ? <div className="text-center text-gray-500 py-12">Loading...</div> :
      banners.length===0 ? <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">No banners yet.</div> : (
        <div className="space-y-3">
          {banners.map(b=>(
            <div key={b._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 group hover:border-gray-700 transition-colors">
              <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                {b.image?.url && <img src={b.image.url} alt={b.title} className="w-full h-full object-cover"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{b.title}</p>
                <p className="text-gray-500 text-xs">{b.position} • Order {b.sortOrder}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.isActive?'bg-green-900/50 text-green-400':'bg-gray-800 text-gray-500'}`}>{b.isActive?'Active':'Inactive'}</span>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>{setEditing(b._id);setForm({title:b.title,subtitle:b.subtitle||'',link:b.link||'',buttonText:b.buttonText||'',position:b.position,isActive:b.isActive,sortOrder:b.sortOrder,'image.url':b.image?.url||''});setShowForm(true);}} className="w-7 h-7 flex items-center justify-center bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50"><Edit2 size={13}/></button>
                <button onClick={async()=>{if(window.confirm('Delete?')){await api.delete('/banners/'+b._id);toast.success('Deleted');load();}}} className="w-7 h-7 flex items-center justify-center bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
