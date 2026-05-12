import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { fetchCurrentUser } from './redux/slices/authSlice';
import { fetchCart } from './redux/slices/cartSlice';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import PageLoader from './components/common/PageLoader';

// Lazy-loaded pages
const Home        = lazy(() => import('./pages/Home'));
const Products    = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart        = lazy(() => import('./pages/Cart'));
const Checkout    = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const About       = lazy(() => import('./pages/About'));
const Contact     = lazy(() => import('./pages/Contact'));
const Dashboard   = lazy(() => import('./pages/dashboard/Dashboard'));
const MyOrders    = lazy(() => import('./pages/dashboard/MyOrders'));
const OrderDetail = lazy(() => import('./pages/dashboard/OrderDetail'));
const Profile     = lazy(() => import('./pages/dashboard/Profile'));
const Wishlist    = lazy(() => import('./pages/dashboard/Wishlist'));
const Addresses   = lazy(() => import('./pages/dashboard/Addresses'));

// Admin pages
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons      = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminBanners      = lazy(() => import('./pages/admin/AdminBanners'));
const AdminCategories   = lazy(() => import('./pages/admin/AdminCategories'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminGallery      = lazy(() => import('./pages/admin/AdminGallery'));
const NotFound          = lazy(() => import('./pages/NotFound'));

export default function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);
  const { isAuthenticated, initializing } = useSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (initializing && localStorage.getItem('token')) return <PageLoader />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', background: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#f9fafb' : '#111827' },
          success: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/"           element={<Home />} />
            <Route path="/products"   element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/category/:slug" element={<Products />} />
            <Route path="/cart"       element={<Cart />} />
            <Route path="/about"      element={<About />} />
            <Route path="/contact"    element={<Contact />} />

            {/* Auth routes (redirect if logged in) */}
            <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout"      element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/dashboard/orders" element={<MyOrders />} />
              <Route path="/dashboard/orders/:id" element={<OrderDetail />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/wishlist" element={<Wishlist />} />
              <Route path="/dashboard/addresses" element={<Addresses />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"             element={<AdminDashboard />} />
              <Route path="/admin/analytics"   element={<AdminAnalytics />} />
              <Route path="/admin/products"    element={<AdminProducts />} />
              <Route path="/admin/orders"      element={<AdminOrders />} />
              <Route path="/admin/users"       element={<AdminUsers />} />
              <Route path="/admin/coupons"     element={<AdminCoupons />} />
              <Route path="/admin/banners"     element={<AdminBanners />} />
              <Route path="/admin/categories"  element={<AdminCategories />} />
              <Route path="/admin/gallery"     element={<AdminGallery />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
