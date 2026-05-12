import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Attach language preference
    const lang = localStorage.getItem('kpp_lang') || 'en';
    config.headers['Accept-Language'] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Auto-logout on 401
    if (response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      // Don't toast if it's just a check on app init
      if (!error.config.url.includes('/auth/me')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    }

    if (response.status === 403) {
      toast.error('You are not authorized to perform this action.');
    }

    if (response.status === 429) {
      toast.error('Too many requests. Please slow down.');
    }

    if (response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;

// ── Utility: Upload file with progress ───────
export const uploadFile = (url, formData, onProgress) => {
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
};

// ── Razorpay payment handler ─────────────────
export const initiateRazorpayPayment = ({ order, user, onSuccess, onFailure }) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh.');
      reject(new Error('Razorpay not loaded'));
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Kiran Printing Press',
      description: 'Premium Printing Services - Dharashiv',
      image: '/logo.png',
      order_id: order.razorpay_order_id,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.mobile,
      },
      theme: { color: '#DC2626' },
      handler: (response) => {
        onSuccess && onSuccess(response);
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          onFailure && onFailure('Payment cancelled');
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onFailure && onFailure(response.error.description);
      reject(new Error(response.error.description));
    });
    rzp.open();
  });
};
