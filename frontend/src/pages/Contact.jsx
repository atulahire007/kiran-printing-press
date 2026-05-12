import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const INQUIRY_TYPES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'bulk_order', label: 'Bulk Order / Quotation' },
  { value: 'design_help', label: 'Design Assistance' },
  { value: 'complaint', label: 'Complaint / Feedback' },
  { value: 'quotation', label: 'Custom Quotation' },
];

const CONTACT_INFO = [
  { icon: <MapPin size={20} className="text-primary" />, title: 'Address', lines: ['Main Road, Dharashiv', 'Maharashtra - 413501', 'India'] },
  { icon: <Phone size={20} className="text-primary" />, title: 'Phone', lines: ['+91 98765 43210', '+91 87654 32109'] },
  { icon: <Mail size={20} className="text-primary" />, title: 'Email', lines: ['kiranprinting@gmail.com', 'orders@kiranprinting.com'] },
  { icon: <Clock size={20} className="text-primary" />, title: 'Business Hours', lines: ['Mon – Sat: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 4:00 PM'] },
];

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/contact', data);
      setSubmitted(true);
      reset();
      toast.success('Message sent! We will get back to you soon.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Kiran Printing Press | Dharashiv, Maharashtra</title>
        <meta name="description" content="Contact Kiran Printing Press in Dharashiv, Maharashtra. Call, WhatsApp, or email us for printing services, bulk orders, and custom quotations." />
      </Helmet>

      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 to-ink text-white py-14">
        <div className="container-main text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-3">{t('contact.title')}</h1>
          <p className="text-gray-300 text-xl">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-main">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Contact info */}
            <div className="space-y-5">
              {CONTACT_INFO.map(({ icon, title, lines }) => (
                <div key={title} className="card p-5 flex items-start gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
                  <div>
                    <p className="font-semibold text-ink dark:text-white mb-1">{title}</p>
                    {lines.map(line => <p key={line} className="text-sm text-gray-500">{line}</p>)}
                  </div>
                </div>
              ))}

              {/* WhatsApp */}
              <a href="https://wa.me/919876543210?text=Hello!%20I%20need%20printing%20services"
                target="_blank" rel="noreferrer"
                className="card p-5 flex items-center gap-4 border-green-200 dark:border-green-800 hover:border-green-400 transition-colors group">
                <div className="w-11 h-11 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-ink dark:text-white group-hover:text-green-600 transition-colors">WhatsApp Us</p>
                  <p className="text-sm text-gray-500">Quick reply within minutes</p>
                </div>
              </a>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-3">Message Sent!</h2>
                  <p className="text-gray-500 mb-6">Thank you for reaching out. We typically respond within 2-4 hours during business hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-primary">Send Another Message</button>
                </div>
              ) : (
                <div className="card p-6 lg:p-8">
                  <h2 className="font-display font-bold text-xl mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label">{t('contact.name')} *</label>
                        <input {...register('name', { required: 'Name is required' })}
                          className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Your full name" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      <div className="form-group">
                        <label className="label">{t('contact.mobile')} *</label>
                        <input {...register('mobile', { required: 'Mobile required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })}
                          className={`input ${errors.mobile ? 'input-error' : ''}`} placeholder="10-digit mobile" maxLength={10} />
                        {errors.mobile && <p className="text-xs text-red-500">{errors.mobile.message}</p>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">{t('contact.email')} <span className="text-gray-400 text-xs">(Optional)</span></label>
                      <input {...register('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                        type="email" className="input" placeholder="you@example.com" />
                    </div>

                    <div className="form-group">
                      <label className="label">{t('contact.inquiry_type')}</label>
                      <select {...register('inquiryType')} className="input">
                        {INQUIRY_TYPES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="label">{t('contact.subject')}</label>
                      <input {...register('subject')} className="input" placeholder="Brief subject line" />
                    </div>

                    <div className="form-group">
                      <label className="label">{t('contact.message')} *</label>
                      <textarea {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'Minimum 20 characters' } })}
                        rows={5} className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                        placeholder="Tell us about your printing requirements, quantity, deadline, etc." />
                      {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full btn-shine gap-2">
                      <Send size={18} />
                      {loading ? 'Sending...' : t('contact.send')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-10 rounded-2xl overflow-hidden shadow-soft h-80 bg-gray-100 dark:bg-gray-800">
            <iframe
              title="Kiran Printing Press - Dharashiv Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15261.2!2d76.0394!3d18.1736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5d7!2sDharashiv%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
