import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, User, Heart, MapPin, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const { t } = useTranslation();
  const items = [
    { to: '/dashboard/orders', icon: <Package size={20} className="text-blue-500" />, label: t('dashboard.orders'), bg: 'bg-blue-50 dark:bg-blue-950' },
    { to: '/dashboard/profile', icon: <User size={20} className="text-green-500" />, label: t('dashboard.profile'), bg: 'bg-green-50 dark:bg-green-950' },
    { to: '/dashboard/wishlist', icon: <Heart size={20} className="text-pink-500" />, label: t('dashboard.wishlist'), bg: 'bg-pink-50 dark:bg-pink-950' },
    { to: '/dashboard/addresses', icon: <MapPin size={20} className="text-purple-500" />, label: t('dashboard.addresses'), bg: 'bg-purple-50 dark:bg-purple-950' },
  ];
  return (
    <div className="container-main py-10 max-w-4xl">
      <div className="card p-6 mb-6 bg-gradient-to-r from-primary to-red-500 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{user?.name?.[0]}</div>
          <div>
            <p className="text-red-100 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-display font-bold">{user?.name}</h1>
            <p className="text-red-100 text-sm mt-0.5">{user?.email}</p>
          </div>
          {user?.loyaltyPoints > 0 && (
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-red-100 text-xs">Loyalty Points</p>
              <p className="text-2xl font-bold">{user.loyaltyPoints}</p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {items.map(({ to, icon, label, bg }) => (
          <Link key={to} to={to} className="card p-5 text-center hover:border-primary/20 transition-colors group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${bg} group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-sm font-medium text-ink dark:text-white">{label}</p>
          </Link>
        ))}
      </div>
      {user?.referralCode && (
        <div className="card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-xl flex items-center justify-center">
              <Gift size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Refer and Earn</p>
              <p className="text-sm text-gray-500">Your code: <span className="font-bold text-primary">{user.referralCode}</span></p>
            </div>
          </div>
          <button onClick={() => navigator.clipboard.writeText(user.referralCode)} className="btn btn-secondary text-sm">Copy</button>
        </div>
      )}
    </div>
  );
}
