import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart, Heart, User, Search, Menu, X, Sun, Moon,
  Globe, ChevronDown, LogOut, LayoutDashboard, Package, Printer
} from 'lucide-react';

import { logoutUser } from '../../redux/slices/authSlice';
import { toggleDarkMode, toggleMobileMenu, closeMobileMenu, setLanguage, toggleSearch } from '../../redux/slices/uiSlice';
import { selectCartCount } from '../../redux/slices/cartSlice';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी',    flag: '🇮🇳' },
];

const NAV_LINKS = [
  { to: '/', label: 'nav.home' },
  { to: '/products', label: 'nav.products' },
  { to: '/about', label: 'nav.about' },
  { to: '/contact', label: 'nav.contact' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { darkMode, mobileMenuOpen, language } = useSelector((s) => s.ui);
  const { user, isAuthenticated, isAdmin } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);

  const [langDropdown, setLangDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const langRef = useRef(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    dispatch(setLanguage(code));
    setLangDropdown(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdown(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'glass shadow-soft' : 'bg-white dark:bg-gray-900'
    } border-b border-gray-100 dark:border-gray-800`}>

      {/* Top bar */}
      <div className="bg-primary text-white text-xs py-1.5 hidden md:block">
        <div className="container-main flex justify-between items-center">
          <span>📍 Dharashiv, Maharashtra | 📞 +91 98765 43210</span>
          <span>Mon-Sat: 9AM - 8PM | Free shipping above ₹499</span>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => dispatch(closeMobileMenu())}>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Printer size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-base text-ink dark:text-white leading-tight">Kiran Printing</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Press • Dharashiv</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/5 dark:bg-primary/10' : 'text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {t(label)}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'text-primary bg-primary/5' : 'text-ink-muted hover:text-primary hover:bg-primary/5'
              }`}>
                {t('nav.admin')}
              </NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search')}
                    className="input w-48 lg:w-64 py-1.5 text-xs"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="btn-icon btn-ghost">
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="btn-icon btn-ghost dark:text-gray-400" aria-label="Search">
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Dark mode */}
            <button onClick={() => dispatch(toggleDarkMode())} className="btn-icon btn-ghost dark:text-gray-400" aria-label="Toggle dark mode">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangDropdown(!langDropdown)}
                className="btn-icon btn-ghost dark:text-gray-400 flex items-center gap-1 px-2" aria-label="Language">
                <Globe size={18} />
                <span className="hidden md:block text-xs font-medium">{activeLang.flag}</span>
                <ChevronDown size={12} className={`transition-transform ${langDropdown ? 'rotate-180' : ''}`} />
              </button>
              {langDropdown && (
                <div className="absolute right-0 top-full mt-2 w-40 card shadow-card-hover py-1 z-50 animate-fade-in">
                  {LANGUAGES.map(({ code, label, flag }) => (
                    <button key={code} onClick={() => handleLanguageChange(code)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        language === code ? 'text-primary font-medium' : 'text-ink dark:text-gray-300'
                      }`}>
                      <span>{flag}</span><span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="btn-icon btn-ghost relative dark:text-gray-400" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-ink dark:text-white max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-52 card shadow-card-hover py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-semibold text-sm text-ink dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: t('nav.dashboard') },
                      { to: '/dashboard/orders', icon: <Package size={16} />, label: t('nav.cart') },
                      { to: '/dashboard/wishlist', icon: <Heart size={16} />, label: t('nav.wishlist') },
                    ].map(({ to, icon, label }) => (
                      <Link key={to} to={to} onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-muted dark:text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {icon}<span>{label}</span>
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors">
                        <LayoutDashboard size={16} /><span>{t('nav.admin')}</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} /><span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost text-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn btn-primary text-sm btn-shine">{t('nav.register')}</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => dispatch(toggleMobileMenu())} className="lg:hidden btn-icon btn-ghost dark:text-gray-400" aria-label="Menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-0.5 animate-fade-in">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                onClick={() => dispatch(closeMobileMenu())}
                className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-primary bg-primary/5' : 'text-ink-muted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {t(label)}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 px-4">
                <Link to="/login" onClick={() => dispatch(closeMobileMenu())} className="btn btn-secondary flex-1 text-sm">{t('nav.login')}</Link>
                <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="btn btn-primary flex-1 text-sm">{t('nav.register')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
