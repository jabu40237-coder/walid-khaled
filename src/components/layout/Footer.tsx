'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Phone, MapPin, Clock, Facebook, Instagram, Music2 } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  const c = useTranslations('contact');

  const quickLinks = [
    { href: `/${locale}`, label: n('home') },
    { href: `/${locale}/projects`, label: n('projects') },
    { href: `/${locale}/services`, label: n('services') },
    { href: `/${locale}/contact`, label: n('contact') },
    { href: `/${locale}/faq`, label: n('faq') },
    { href: `/${locale}/consultation`, label: n('consultation') },
  ];

  return (
    <footer className="bg-primary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-4">
              <div className="text-3xl font-display font-bold tracking-wider">
                <span className="text-white">W</span>
                <span className="text-gold">K</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {t('description')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/1APX5nYKUM/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/30 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/walid_khalid444"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/30 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@walidkhald0"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/30 transition-all"
                aria-label="TikTok"
              >
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('quick_links')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li>{locale === 'ar' ? 'عزل الواجهات EPS' : locale === 'kurd' ? 'Îzolasyona Façade EPS' : 'EPS Facade Insulation'}</li>
              <li>{locale === 'ar' ? 'تصميم الواجهات الخارجية' : locale === 'kurd' ? 'Sêwirana Façadeyên Derve' : 'Exterior Facade Design'}</li>
              <li>{locale === 'ar' ? 'الديكور الخارجي الفاخر' : locale === 'kurd' ? 'Dekorasyona Derve ya Luks' : 'Luxury Exterior Decoration'}</li>
              <li>{locale === 'ar' ? 'الأعمدة والعناصر المعمارية' : locale === 'kurd' ? 'Stûn û Hêmanên Mîmarî' : 'Columns & Architectural Elements'}</li>
              <li>{locale === 'ar' ? 'تصميم ثلاثي الأبعاد قبل التنفيذ' : locale === 'kurd' ? 'Sêwirana 3D Berî Cîbicîkirinê' : '3D Design Before Execution'}</li>
              <li>{locale === 'ar' ? 'إشراف كامل على المشروع' : locale === 'kurd' ? 'Çavdêriya Tevahî ya Projeyê' : 'Full Project Supervision'}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact_info')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/50">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div>
                  <a href="tel:07507669742" className="hover:text-gold transition-colors block">0750 766 9742</a>
                  <a href="tel:07824440503" className="hover:text-gold transition-colors block">0782 444 0503</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{c('address')}</span>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{locale === 'ar' ? 'السبت – الخميس: ٨:٠٠ صباحاً – ٦:٠٠ مساءً' : locale === 'kurd' ? 'Şemî – Pêncşem: 8:00 sibê – 6:00 êvarê' : 'Sat – Thu: 8:00 AM – 6:00 PM'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} Walid Khaled. {t('rights')}.
          </p>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href={`/${locale}/privacy`} className="hover:text-white/60 transition-colors">
              {t('privacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-white/60 transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
