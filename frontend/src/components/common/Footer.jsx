import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Printer, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

const PRODUCT_LINKS = [
  'Visiting Cards', 'Wedding Cards', 'Flex Printing', 'Banner Printing',
  'T-Shirt Printing', 'Mug Printing', 'Pamphlets', 'ID Cards',
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">

      {/* Main footer */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Printer size={22} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-lg leading-tight">Kiran Printing</p>
                <p className="text-xs text-gray-500 leading-none">Press • Dharashiv</p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">{t('footer.tagline')}</p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
                { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
                { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
                { icon: <MessageCircle size={18} />, href: 'https://wa.me/919876543210', label: 'WhatsApp' },
              ].map(({ icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-200">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/products', label: t('nav.products') },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/login', label: t('nav.login') },
                { to: '/register', label: t('nav.register') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1">
                    <span className="text-primary text-xs">›</span>{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((service) => (
                <li key={service}>
                  <Link to={`/products?q=${encodeURIComponent(service)}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1">
                    <span className="text-primary text-xs">›</span>{service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">{t('footer.contact_us')}</h3>
            <ul className="space-y-3.5">
              {[
                { icon: <MapPin size={16} className="shrink-0 text-primary mt-0.5" />, text: 'Main Road, Dharashiv, Maharashtra - 413501' },
                { icon: <Phone size={16} className="shrink-0 text-primary" />, text: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: <Mail size={16} className="shrink-0 text-primary" />, text: 'kiranprinting@gmail.com', href: 'mailto:kiranprinting@gmail.com' },
                { icon: <Clock size={16} className="shrink-0 text-primary" />, text: 'Mon–Sat: 9:00 AM – 8:00 PM' },
              ].map(({ icon, text, href }) => (
                <li key={text} className="flex items-start gap-2.5">
                  {icon}
                  {href ? (
                    <a href={href} className="text-sm text-gray-400 hover:text-white transition-colors">{text}</a>
                  ) : (
                    <span className="text-sm text-gray-400">{text}</span>
                  )}
                </li>
              ))}
            </ul>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919876543210?text=Hello!%20I%20need%20printing%20services"
              target="_blank" rel="noreferrer"
              className="mt-5 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-fit">
              <MessageCircle size={16} />
              {t('contact.whatsapp')}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-5">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} Kiran Printing Press. {t('footer.rights')}.</p>
          <p>{t('footer.made_in')}</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
