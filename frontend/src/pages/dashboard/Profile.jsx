import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile } from '../../redux/slices/authSlice';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user, loading } = useSelector((s) => s.auth);
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, mobile: user?.mobile, preferredLanguage: user?.preferredLanguage } });
  const onSubmit = (data) => dispatch(updateProfile(data));
  return (
    <div className="container-main py-10 max-w-xl">
      <h1 className="page-title mb-6">{t('dashboard.profile')}</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[['name','Full Name','text'],['mobile','Mobile Number','tel']].map(([n,l,t]) => (
            <div key={n} className="form-group">
              <label className="label">{l}</label>
              <input {...register(n)} type={t} className="input" />
            </div>
          ))}
          <div className="form-group">
            <label className="label">Email <span className="text-gray-400 text-xs">(Cannot change)</span></label>
            <input value={user?.email} disabled className="input opacity-60" />
          </div>
          <div className="form-group">
            <label className="label">Preferred Language</label>
            <select {...register('preferredLanguage')} className="input">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Loyalty Points</label>
            <div className="input bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <span className="font-bold text-primary">{user?.loyaltyPoints || 0} pts</span>
              <span className="text-xs text-gray-400">= ₹{((user?.loyaltyPoints || 0) * 0.1).toFixed(0)} value</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
