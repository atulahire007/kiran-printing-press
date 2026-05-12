import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Star, ShieldCheck, Truck, Clock, Headphones,
  Zap, Award, ChevronRight, Phone
} from 'lucide-react';
import { fetchFeaturedProducts, fetchCategories } from '../redux/slices/productSlice';
import ProductCard, { ProductCardSkeleton } from '../components/common/ProductCard';

const CATEGORIES = [
  { name: 'Visiting Cards', icon: '💼', color: 'bg-blue-50 dark:bg-blue-950', slug: 'visiting-cards' },
  { name: 'Wedding Cards', icon: '💍', color: 'bg-pink-50 dark:bg-pink-950', slug: 'wedding-cards' },
  { name: 'Flex Printing', icon: '🖼️', color: 'bg-purple-50 dark:bg-purple-950', slug: 'flex-printing' },
  { name: 'Banner Printing', icon: '📢', color: 'bg-orange-50 dark:bg-orange-950', slug: 'banner-printing' },
  { name: 'T-Shirt Printing', icon: '👕', color: 'bg-green-50 dark:bg-green-950', slug: 't-shirt-printing' },
  { name: 'Mug Printing', icon: '☕', color: 'bg-yellow-50 dark:bg-yellow-950', slug: 'mug-printing' },
  { name: 'Pamphlets', icon: '📄', color: 'bg-teal-50 dark:bg-teal-950', slug: 'pamphlets' },
  { name: 'ID Cards', icon: '🪪', color: 'bg-indigo-50 dark:bg-indigo-950', slug: 'id-cards' },
  { name: 'Xerox & Lamination', icon: '📋', color: 'bg-gray-50 dark:bg-gray-900', slug: 'xerox-lamination' },
  { name: 'Offset Printing', icon: '🖨️', color: 'bg-red-50 dark:bg-red-950', slug: 'offset-printing' },
  { name: 'Digital Printing', icon: '💻', color: 'bg-cyan-50 dark:bg-cyan-950', slug: 'digital-printing' },
  { name: 'Photo Frames', icon: '🖼', color: 'bg-amber-50 dark:bg-amber-950', slug: 'photo-frames' },
];

const WHY_US = [
  { icon: <Award className="text-primary" size={28} />, key: 'quality' },
  { icon: <Clock className="text-primary" size={28} />, key: 'fast' },
  { icon: <ShieldCheck className="text-primary" size={28} />, key: 'affordable' },
  { icon: <Zap className="text-primary" size={28} />, key: 'custom' },
  { icon: <Headphones className="text-primary" size={28} />, key: 'support' },
  { icon: <Truck className="text-primary" size={28} />, key: 'delivery' },
];

const TESTIMONIALS = [
  { name: 'Rahul Patil', city: 'Dharashiv', rating: 5, text: 'Excellent quality visiting cards! Fast delivery and very professional finish. Highly recommended.', business: 'Patil Enterprises' },
  { name: 'Priya Deshmukh', city: 'Solapur', rating: 5, text: 'Got our wedding cards printed here. Beautiful work, unique design, and delivered on time. Thank you!', business: 'Bride' },
  { name: 'Sanjay Kulkarni', city: 'Latur', rating: 5, text: 'Best flex printing in the region. Colors are vibrant and the material is very durable.', business: 'Kulkarni Traders' },
  { name: 'Anita More', city: 'Osmanabad', rating: 4, text: 'Great experience ordering T-shirt printing for our college event. Bulk order was handled very well.', business: 'SRSC College' },
];

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Printing Services' },
  { value: '18+', label: 'Years Experience' },
  { value: '24hr', label: 'Fast Turnaround' },
];

export default function Home() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { featured, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts('featured'));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>Kiran Printing Press - Premium Printing Services in Dharashiv, Maharashtra</title>
        <meta name="description" content="Best printing services in Dharashiv, Maharashtra. Visiting cards, wedding cards, flex printing, T-shirt printing, and more. Quality printing at affordable prices." />
        <meta property="og:title" content="Kiran Printing Press - Dharashiv" />
        <meta property="og:description" content="Premium printing services in Dharashiv, Maharashtra since 2005." />
        <link rel="canonical" href="https://kiranprinting.com/" />
      </Helmet>

      {/* ─── HERO ──────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-ink text-white min-h-[92vh] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />

        {/* Decorative red blob */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-bl from-primary/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute right-20 top-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container-main py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary text-sm font-medium">Est. 2005 · Dharashiv, Maharashtra</span>
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.05] mb-6">
                {t('home.hero_title')}
                <span className="block text-primary mt-1">in Dharashiv</span>
              </h1>

              <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-xl">
                From visiting cards to large-format banners — precision printing with vibrant colours, delivered fast.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/products" className="btn btn-primary btn-lg btn-shine gap-2 text-base">
                  {t('home.hero_cta')} <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg text-base">
                  {t('home.hero_cta2')}
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="text-center sm:text-left">
                    <p className="text-2xl font-display font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side visual */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    {['Visiting Cards', 'Wedding Cards', 'Flex Print', 'T-Shirts', 'Banners', 'Mugs'].map((item, idx) => (
                      <div key={item} className={`bg-white/10 rounded-xl p-4 text-center hover:bg-primary/20 transition-colors cursor-pointer ${idx < 2 ? 'animate-fade-up' : ''}`}
                        style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="text-2xl mb-1">{['💼','💍','🖼️','👕','📢','☕'][idx]}</div>
                        <p className="text-xs text-gray-300 font-medium">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-primary/20 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Phone size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Call for bulk orders</p>
                      <p className="text-gray-300 text-xs">+91 98765 43210</p>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-primary rounded-xl px-4 py-2 shadow-brand animate-float">
                  <p className="text-white text-sm font-bold">Free Delivery</p>
                  <p className="text-red-200 text-xs">Orders above ₹499</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ────────────────────── */}
      <section className="section-sm bg-paper-off dark:bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="section-title">{t('home.categories_title')}</h2>
            <p className="text-gray-500 mt-2">Everything you need, printed to perfection</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(({ name, icon, color, slug }) => (
              <Link key={slug} to={`/category/${slug}`}
                className={`${color} rounded-xl p-4 text-center hover:scale-[1.03] transition-transform duration-200 cursor-pointer group border border-transparent hover:border-primary/20`}>
                <div className="text-3xl mb-2.5 group-hover:scale-110 transition-transform">{icon}</div>
                <p className="text-xs font-semibold text-ink dark:text-white leading-tight">{name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─────────────── */}
      <section className="section">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">{t('home.featured_title')}</h2>
              <p className="text-gray-500 mt-1 text-sm">Handpicked bestsellers for you</p>
            </div>
            <Link to="/products" className="btn btn-outline text-sm hidden sm:flex">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featured.slice(0, 12).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>Products coming soon!</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── OFFER BANNER ──────────────────── */}
      <section className="py-12 bg-gradient-to-r from-primary via-red-500 to-red-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='2' fill='white'/%3E%3C/svg%3E\")" }} />
        <div className="container-main relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-3">🎉 Limited Time Offer</div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold">Get 20% OFF on First Order</h2>
              <p className="text-red-100 mt-2">Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded">KIRAN20</span> at checkout</p>
            </div>
            <Link to="/products" className="btn bg-white text-primary hover:bg-gray-100 btn-lg font-bold shrink-0">
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY US ────────────────────────── */}
      <section className="section bg-paper-off dark:bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.why_us_title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map(({ icon, key }) => (
              <div key={key} className="card p-6 group hover:border-primary/20 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h3 className="font-display font-bold text-lg text-ink dark:text-white mb-2">{t(`whyus.${key}`)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(`whyus.${key}_desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────── */}
      <section className="section">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('home.testimonials_title')}</h2>
            <p className="text-gray-500 mt-2 text-sm">Trusted by thousands across Maharashtra</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(({ name, city, rating, text, business }) => (
              <div key={name} className="card p-5 hover:border-primary/20 transition-colors">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 italic">"{text}"</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink dark:text-white">{name}</p>
                    <p className="text-xs text-gray-400">{business} · {city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MAP & CONTACT CTA ─────────────── */}
      <section className="section-sm bg-paper-off dark:bg-gray-900">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="section-title mb-4">Visit Our Press</h2>
              <p className="text-gray-500 mb-6">Come visit us at our printing facility in Dharashiv, Maharashtra. We'll show you our range of printing equipment and discuss your requirements in person.</p>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>📍 Main Road, Dharashiv, Maharashtra - 413501</p>
                <p>📞 +91 98765 43210 | +91 87654 32109</p>
                <p>🕐 Mon–Sat: 9:00 AM – 8:00 PM</p>
                <p>📧 kiranprinting@gmail.com</p>
              </div>
              <div className="flex gap-3 mt-6">
                <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                <a href="tel:+919876543210" className="btn btn-outline">
                  <Phone size={16} /> Call Now
                </a>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden shadow-soft h-72 bg-gray-200 dark:bg-gray-800 relative">
              <iframe
                title="Kiran Printing Press Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30522.43!2d76.0394!3d18.1736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc5d7!2sDharaShiv!5e0!3m2!1sen!2sin!4v1"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
