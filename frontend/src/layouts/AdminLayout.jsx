import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Image, Grid, BarChart2, ChevronLeft, ChevronRight,
  LogOut, Bell, Printer, Menu, X, GalleryHorizontal
} from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';

const ADMIN_NAV = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/categories', icon: <Grid size={18} />, label: 'Categories' },
  { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
  { to: '/admin/coupons', icon: <Tag size={18} />, label: 'Coupons' },
  { to: '/admin/banners', icon: <Image size={18} />, label: 'Banners' },
  { to: '/admin/gallery', icon: <GalleryHorizontal size={18} />, label: 'Gallery' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const NavItem = ({ item }) => (
    <NavLink to={item.to} end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`
      }
      onClick={() => setMobileOpen(false)}>
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col shrink-0 bg-gray-900 border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-800 px-4 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Printer size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-white text-sm leading-tight">Kiran Printing</p>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map(item => <NavItem key={item.to} item={item} />)}
        </nav>

        {/* User & collapse */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">{user?.name?.[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                <p className="text-gray-500 text-[10px] capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
            <LogOut size={16} />
            {!collapsed && 'Logout'}
          </button>
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Printer size={17} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Kiran Admin</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {ADMIN_NAV.map(item => <NavItem key={item.to} item={item} />)}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu size={22} />
            </button>
            <Link to="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              ← Back to website
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative btn-icon text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user?.name?.[0]}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
