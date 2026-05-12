// ══════════════════════════════════════════
// Login.jsx
// ══════════════════════════════════════════
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Printer, Phone } from 'lucide-react';
import { loginUser } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { loading } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('email'); // 'email' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    if (loginMode === 'email') {
      const result = await dispatch(loginUser(data));
      if (result.meta.requestStatus === 'fulfilled') navigate(from, { replace: true });
    } else {
      // OTP verify
      setOtpLoading(true);
      try {
        const res = await api.post('/auth/verify-otp', { mobile: data.mobile, otp: data.otp });
        localStorage.setItem('token', res.data.token);
        navigate(from, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Invalid OTP');
      } finally {
        setOtpLoading(false);
      }
    }
  };

  const sendOTP = async () => {
    const mobile = watch('mobile');
    if (!mobile || mobile.length !== 10) { toast.error('Enter valid 10-digit mobile number'); return; }
    setOtpLoading(true);
    try {
      await api.post('/auth/send-otp', { mobile });
      setOtpSent(true);
      toast.success('OTP sent to ' + mobile);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-brand">
            <Printer size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink dark:text-white">{t('auth.login_title')}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('auth.login_subtitle')}</p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
          {[
            { mode: 'email', label: 'Email', icon: <Mail size={14} /> },
            { mode: 'otp', label: 'OTP', icon: <Phone size={14} /> },
          ].map(({ mode, label, icon }) => (
            <button key={mode} onClick={() => setLoginMode(mode)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                loginMode === mode ? 'bg-white dark:bg-gray-700 text-ink dark:text-white shadow-sm' : 'text-gray-500 hover:text-ink dark:hover:text-white'
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>

        <div className="card p-6 shadow-soft">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loginMode === 'email' ? (
              <>
                <div className="form-group">
                  <label className="label">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                      className={`input pl-9 ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" type="email" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div className="form-group">
                  <div className="flex justify-between mb-1.5">
                    <label className="label mb-0">{t('auth.password')}</label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t('auth.forgot_password')}</Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('password', { required: 'Password required' })}
                      type={showPassword ? 'text' : 'password'}
                      className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg btn-shine">
                  {loading ? 'Signing in...' : t('auth.login_btn')}
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="label">{t('auth.mobile')}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input {...register('mobile', { required: true, pattern: /^[6-9]\d{9}$/ })}
                        className="input pl-9" placeholder="10-digit mobile" maxLength={10} />
                    </div>
                    <button type="button" onClick={sendOTP} disabled={otpLoading || otpSent}
                      className="btn btn-secondary text-sm shrink-0">
                      {otpLoading ? '...' : otpSent ? 'Resend' : t('auth.send_otp')}
                    </button>
                  </div>
                </div>
                {otpSent && (
                  <div className="form-group">
                    <label className="label">Enter OTP</label>
                    <input {...register('otp', { required: true })}
                      className="input text-center text-2xl tracking-[0.5em] font-mono"
                      placeholder="000000" maxLength={6} />
                    <p className="text-xs text-gray-400 mt-1">{t('auth.otp_sent')}</p>
                  </div>
                )}
                <button type="submit" disabled={!otpSent || otpLoading} className="btn btn-primary w-full btn-lg">
                  {otpLoading ? 'Verifying...' : t('auth.verify_otp')}
                </button>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">{t('auth.register_btn')}</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
