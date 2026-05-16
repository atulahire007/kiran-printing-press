// ══════════════════════════════════════════
// misc.jsx — all imports at TOP (required by Vite/ESM)
// Contains: Register, ForgotPassword, ResetPassword, OrderSuccess, NotFound
// ══════════════════════════════════════════
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, User, Mail, Lock, Phone, Printer,
  CheckCircle2, Package, ArrowRight
} from 'lucide-react';
import { registerUser } from '../redux/slices/authSlice';
import { fetchOrderById } from '../redux/slices/orderSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

// ══════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════
export function Register() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const { loading } = useSelector((s) => s.auth);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (result.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Printer size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">{t('auth.register_title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('auth.register_subtitle')}</p>
        </div>

        <div className="card p-6 shadow-soft">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="label">{t('auth.name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  className={`input pl-9 ${errors.name ? 'input-error' : ''}`} placeholder="Your full name" />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  type="email" className={`input pl-9 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">{t('auth.mobile')} <span className="text-gray-400 text-xs">(Optional)</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })}
                  className={`input pl-9 ${errors.mobile ? 'input-error' : ''}`} placeholder="10-digit mobile" maxLength={10} />
              </div>
              {errors.mobile && <p className="text-xs text-red-500">{errors.mobile.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showPwd ? 'text' : 'password'}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: v => v === watch('password') || 'Passwords do not match',
                })}
                  type="password" className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`} placeholder="Repeat password" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Preferred Language</label>
              <select {...register('preferredLanguage')} className="input">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg btn-shine mt-2">
              {loading ? 'Creating account...' : t('auth.register_btn')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.login_btn')}</Link>
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════
export function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold">{t('auth.forgot_password')}</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-bold text-lg mb-2">Email Sent!</h2>
            <p className="text-gray-500 text-sm">Check your inbox for the password reset link.</p>
            <Link to="/login" className="btn btn-primary mt-6 w-full">Back to Login</Link>
          </div>
        ) : (
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input pl-9" placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="btn btn-ghost w-full text-sm">← Back to Login</Link>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// RESET PASSWORD
// ══════════════════════════════════════════
export function ResetPassword() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm card p-8">
        <h1 className="font-display font-bold text-2xl mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input" placeholder="Min 8 characters" minLength={8} required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ORDER SUCCESS
// ══════════════════════════════════════════
export function OrderSuccess() {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const { currentOrder: order } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  return (
    <div className="container-main py-16 max-w-2xl mx-auto text-center">
      <div className="card p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={42} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Order Placed! 🎉</h1>
        {order && (
          <>
            <p className="text-gray-500 mb-1">
              Order Number: <span className="font-bold text-ink dark:text-white">{order.orderNumber}</span>
            </p>
            <p className="text-gray-500 mb-6">
              Total: <span className="font-bold text-primary">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </p>
          </>
        )}
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          Thank you for choosing Kiran Printing Press! We will send you updates via email and WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/dashboard/orders/${id}`} className="btn btn-primary gap-2">
            <Package size={18} /> Track Order
          </Link>
          <Link to="/products" className="btn btn-secondary gap-2">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// NOT FOUND
// ══════════════════════════════════════════
export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-display font-bold text-primary/20 mb-2">404</div>
      <h1 className="text-3xl font-display font-bold mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/products" className="btn btn-secondary">Browse Products</Link>
      </div>
    </div>
  );
}

export default NotFound;
