// ══════════════════════════════════════════
// About.jsx
// ══════════════════════════════════════════
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Award, Users, Printer, Zap, Heart, Target } from 'lucide-react';

const MILESTONES = [
  { year: '2005', title: 'Founded', desc: 'Started as a small offset printing unit in Dharashiv' },
  { year: '2010', title: 'Digital Expansion', desc: 'Added digital printing capabilities and T-shirt printing' },
  { year: '2015', title: 'Large Format', desc: 'Launched flex and banner printing services' },
  { year: '2019', title: 'Online Platform', desc: 'Launched online ordering system' },
  { year: '2023', title: '10,000+ Customers', desc: 'Crossed 10,000 happy customers milestone' },
  { year: '2024', title: 'Pan-India Delivery', desc: 'Expanded to deliver across India' },
];

const TEAM = [
  { name: 'Kiran Patil', role: 'Founder & CEO', exp: '18+ years in printing', emoji: '👨‍💼' },
  { name: 'Sunita Patil', role: 'Operations Manager', exp: '12+ years experience', emoji: '👩‍💼' },
  { name: 'Rohit Deshmukh', role: 'Lead Designer', exp: '8+ years in graphic design', emoji: '👨‍🎨' },
  { name: 'Priya More', role: 'Customer Relations', exp: '6+ years in customer service', emoji: '👩‍💻' },
];

const INFRASTRUCTURE = [
  { icon: '🖨️', name: 'Offset Printing Machine', desc: 'Heidelberg 4-color offset press' },
  { icon: '💻', name: 'Digital Printing', desc: 'HP Indigo digital press for short runs' },
  { icon: '📸', name: 'Large Format Printer', desc: 'Roland wide-format for banners & flex' },
  { icon: '✂️', name: 'Finishing Equipment', desc: 'Lamination, binding, cutting machines' },
  { icon: '👕', name: 'DTG Printer', desc: 'Direct-to-garment T-shirt printing' },
  { icon: '🎁', name: 'Sublimation Unit', desc: 'Mug, frame, and promotional item printing' },
];

export function About() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>About Us - Kiran Printing Press | Dharashiv, Maharashtra</title>
        <meta name="description" content="Learn about Kiran Printing Press - your trusted printing partner in Dharashiv, Maharashtra since 2005." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-ink text-white py-16 lg:py-24">
        <div className="container-main text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full mb-5">
            <Heart size={14} className="text-primary" />
            <span className="text-primary text-sm font-medium">Est. 2005 · Dharashiv, Maharashtra</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4">{t('about.title')}</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-5">{t('about.our_story')}</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>Kiran Printing Press was founded in 2005 by <strong className="text-ink dark:text-white">Kiran Patil</strong> with a simple mission — to provide high-quality, affordable printing services to the businesses and people of Dharashiv and the surrounding Marathwada region.</p>
                <p>Starting with a single offset printing machine in a modest 200 sq ft shop on the main road of Dharashiv, we have grown into a full-service printing facility spanning over 2,000 sq ft, equipped with the latest digital and offset printing technology.</p>
                <p>Today, we proudly serve over 10,000 customers — from small local businesses and street vendors needing visiting cards, to large corporations ordering bulk marketing materials, to families wanting beautiful wedding invitations.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '18+', label: 'Years Experience', icon: <Award className="text-primary" size={24} /> },
                { value: '10,000+', label: 'Happy Customers', icon: <Users className="text-primary" size={24} /> },
                { value: '50+', label: 'Print Services', icon: <Printer className="text-primary" size={24} /> },
                { value: '24hr', label: 'Fast Turnaround', icon: <Zap className="text-primary" size={24} /> },
              ].map(({ value, label, icon }) => (
                <div key={label} className="card p-5 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">{icon}</div>
                  <p className="text-2xl font-display font-bold text-ink dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-sm bg-paper-off dark:bg-gray-900">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Target size={28} className="text-primary" />, title: t('about.mission'), text: 'To provide world-class printing services at affordable prices to every business and individual in Maharashtra, empowering them to communicate their message with impact through quality print materials.' },
              { icon: <Zap size={28} className="text-primary" />, title: t('about.vision'), text: 'To be the most trusted and preferred printing partner across Maharashtra, known for innovation, quality, and exceptional customer service. We aim to grow with our customers and bring the latest printing technology within their reach.' },
            ].map(({ icon, title, text }) => (
              <div key={title} className="card p-7">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">{icon}</div>
                <h3 className="text-xl font-display font-bold text-ink dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container-main">
          <h2 className="section-title text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent hidden lg:block" />
            <div className="space-y-8">
              {MILESTONES.map(({ year, title, desc }, i) => (
                <div key={year} className={`flex flex-col lg:flex-row items-center gap-6 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="card p-5 inline-block text-left max-w-sm">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{year}</span>
                      <h3 className="font-bold text-lg mt-2 mb-1">{title}</h3>
                      <p className="text-gray-500 text-sm">{desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0 z-10 shadow-brand">{i + 1}</div>
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="section-sm bg-paper-off dark:bg-gray-900">
        <div className="container-main">
          <h2 className="section-title text-center mb-10">{t('about.infrastructure')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INFRASTRUCTURE.map(({ icon, name, desc }) => (
              <div key={name} className="card p-5 flex items-start gap-4 hover:border-primary/20 transition-colors">
                <span className="text-3xl shrink-0">{icon}</span>
                <div>
                  <h3 className="font-semibold text-ink dark:text-white mb-1">{name}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container-main">
          <h2 className="section-title text-center mb-10">{t('about.team')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map(({ name, role, exp, emoji }) => (
              <div key={name} className="card p-6 text-center hover:border-primary/20 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-3xl">{emoji}</div>
                <h3 className="font-bold text-ink dark:text-white">{name}</h3>
                <p className="text-sm text-primary font-medium mt-0.5">{role}</p>
                <p className="text-xs text-gray-400 mt-1">{exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
export default About;
