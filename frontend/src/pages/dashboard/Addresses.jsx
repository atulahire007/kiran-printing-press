import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addAddress, deleteAddress } from '../../redux/slices/authSlice';
import { Plus, Trash2, MapPin } from 'lucide-react';

export default function Addresses() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => { dispatch(addAddress(data)); reset(); setShowForm(false); };
  return (
    <div className="container-main py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">My Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary gap-1.5 text-sm">
          <Plus size={16} /> Add Address
        </button>
      </div>
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">New Address</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[['name','Full Name'],['mobile','Mobile Number']].map(([n,l]) => (
                <div key={n} className="form-group">
                  <label className="label">{l}</label>
                  <input {...register(n, {required:true})} className="input" />
                </div>
              ))}
            </div>
            <div className="form-group"><label className="label">Address Line 1</label><input {...register('addressLine1',{required:true})} className="input" /></div>
            <div className="form-group"><label className="label">Address Line 2</label><input {...register('addressLine2')} className="input" /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[['city','City'],['district','District'],['pincode','Pincode']].map(([n,l]) => (
                <div key={n} className="form-group"><label className="label">{l}</label><input {...register(n,{required:true})} className="input" /></div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group"><label className="label">State</label><input {...register('state')} defaultValue="Maharashtra" className="input" /></div>
              <div className="form-group"><label className="label">Type</label>
                <select {...register('addressType')} className="input">
                  <option value="home">Home</option><option value="office">Office</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Save Address</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {user?.addresses?.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No saved addresses. Add one to speed up checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {user.addresses.map(addr => (
            <div key={addr._id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{addr.name}</span>
                    <span className="badge badge-gray capitalize">{addr.addressType}</span>
                    {addr.isDefault && <span className="badge badge-green">Default</span>}
                  </div>
                  <p className="text-sm text-gray-500">{addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}</p>
                  <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-sm text-gray-500">📞 {addr.mobile}</p>
                </div>
              </div>
              <button onClick={() => dispatch(deleteAddress(addr._id))} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
