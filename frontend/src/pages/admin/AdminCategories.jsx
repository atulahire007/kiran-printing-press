import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({name:'',nameHi:'',nameMr:'',icon:'',isActive:true,sortOrder:0});
  const [saving, setSaving] = useState(false);

  const load = async () => { try { const {data}=await api.get('/categories'); setCats(data.data.categories); } catch{} finally{setLoading(false);} };
  useEffect(()=>{load();},[]);

  const save = async () => {
    setSaving(true);
    try {
      editing ? await api.put('/categories/'+editing,form) : await api.post('/categories',form);
      toast.success(editing?'Updated':'Created'); setShowForm(false); setEditing(null); load();
    } catch(e){toast.error(e.response?.data?.message||'Failed');} finally{setSaving(false);}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Categories</h1>
        <button onClick={()=>{setShowForm(true);setEditing(null);setForm({name:'',nameHi:'',nameMr:'',icon:'',isActive:true,sortOrder:0});}} className="btn btn-primary text-sm gap-1.5"><Plus size={16}/>Add</button>
      </div>
      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editing?'Edit':'Add'} Category</h2>
            <div className="space-y-3">
              {[['name','Name (English)'],['nameHi','Name (Hindi)'],['nameMr','Name (Marathi)'],['icon','Icon (emoji)']].map(([k,l])=>(
                <div key={k}><label className="block text-xs text-gray-400 mb-1">{l}</label>
                  <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-400 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:parseInt(e.target.value)}))} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"/></div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} className="accent-primary"/>
                    <span className="text-sm text-gray-300">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving} className="btn btn-primary flex-1">{saving?'Saving...':editing?'Update':'Create'}</button>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_,i)=><div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-24 animate-pulse"/>) :
        cats.map(c=>(
          <div key={c._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between group hover:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon||'📦'}</span>
              <div>
                <p className="text-white font-medium text-sm">{c.name}</p>
                <p className="text-gray-500 text-xs">{c.productCount||0} products • Order {c.sortOrder}</p>
              </div>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={()=>{setEditing(c._id);setForm({name:c.name,nameHi:c.nameHi||'',nameMr:c.nameMr||'',icon:c.icon||'',isActive:c.isActive,sortOrder:c.sortOrder});setShowForm(true);}} className="w-7 h-7 flex items-center justify-center bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50"><Edit2 size={13}/></button>
              <button onClick={async()=>{if(window.confirm('Delete?')){await api.delete('/categories/'+c._id);toast.success('Deleted');load();}}} className="w-7 h-7 flex items-center justify-center bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
