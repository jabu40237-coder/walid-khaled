'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Music2,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { cn, getWhatsAppLink } from '@/lib/utils';
import { getSettings } from '@/lib/data';
import type { SiteSettings } from '@/types';

function ContactCard({
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass p-6 card-hover flex flex-col items-start gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-gold" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <div className="text-white/60 text-sm space-y-1">{children}</div>
      </div>
    </motion.div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
  color = 'text-white/50 hover:text-gold',
  delay = 0,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-center gap-3 glass p-4 card-hover group',
        color
      )}
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-white/30 text-xs">
          {href.includes('facebook') ? 'Facebook' : href.includes('instagram') ? 'Instagram' : 'TikTok'}
        </p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-gold transition-colors" />
    </motion.a>
  );
}

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('contact');
  const c = useTranslations('common');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const phone1 = settings?.phone1 || '07507669742';
  const phone2 = settings?.phone2 || '07824440503';
  const whatsapp = settings?.whatsapp || '07507669742';
  const email = settings?.email || 'info@walidkhaled.com';
  const address = settings?.address
    ? locale === 'ar'
      ? settings.address.ar
      : locale === 'kurd'
      ? settings.address.kurd
      : settings.address.en
    : 'Duhok – Iraq';
  const workingHours = settings?.workingHours
    ? locale === 'ar'
      ? settings.workingHours.ar
      : locale === 'kurd'
      ? settings.workingHours.kurd
      : settings.workingHours.en
    : 'Sat – Thu: 8:00 AM – 6:00 PM';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h1 className="section-heading text-gradient-gold mb-4">
              {t('title')}
            </h1>
            <p className="section-subheading max-w-xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="accent-line mx-auto mt-6" />
          </motion.div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Phone */}
            <ContactCard icon={Phone} title={t('phone')} delay={0.1}>
              <a
                href={`tel:${phone1}`}
                className="block hover:text-gold transition-colors"
                dir="ltr"
              >
                {phone1.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
              </a>
              {phone2 && (
                <a
                  href={`tel:${phone2}`}
                  className="block hover:text-gold transition-colors"
                  dir="ltr"
                >
                  {phone2.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
                </a>
              )}
            </ContactCard>

            {/* Address */}
            <ContactCard icon={MapPin} title={t('address')} delay={0.2}>
              <p>{address}</p>
            </ContactCard>

            {/* Working Hours */}
            <ContactCard icon={Clock} title={t('working_hours')} delay={0.3}>
              <p>{workingHours}</p>
            </ContactCard>

            {/* Email */}
            <ContactCard icon={Mail} title={t('email')} delay={0.4}>
              <a
                href={`mailto:${email}`}
                className="hover:text-gold transition-colors break-all"
              >
                {email}
              </a>
            </ContactCard>

            {/* WhatsApp */}
            <ContactCard icon={MessageCircle} title={t('whatsapp')} delay={0.5}>
              <a
                href={getWhatsAppLink(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t('whatsapp_button')}
              </a>
            </ContactCard>

            {/* Consultation CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-6 flex flex-col items-start gap-4 bg-gradient-to-br from-gold/5 to-transparent border-gold/10"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">{t('request_consultation')}</h3>
                <p className="text-white/50 text-sm mb-4">
                  {locale === 'ar'
                    ? 'املأ النموذج وسنتواصل معك قريباً'
                    : locale === 'kurd'
                    ? 'Formê tijî bike û em ê di demek nêzîk de bi te re têkilî daynin'
                    : 'Fill out the form and we will contact you shortly'}
                </p>
                <a
                  href={`/${locale}/consultation`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-primary text-sm font-semibold hover:bg-gold-400 transition-colors group"
                >
                  {t('request_consultation')}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass overflow-hidden"
          >
            <div className="relative w-full h-0 pb-[40%] min-h-[300px] bg-white/[0.02]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51462.68425135535!2d42.96542083070117!3d36.86166778433599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40089e1a4b8e7b3b%3A0xb3b9b6e6b8e3e8f2!2sDuhok%2C%20Iraq!5e0!3m2!1sen!2s!4v1700000000000"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Duhok Location"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              {t('follow_us')}
            </h2>
            <div className="accent-line mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <SocialLink
              href="https://www.facebook.com/share/1APX5nYKUM/"
              icon={Facebook}
              label={locale === 'ar' ? 'فيسبوك' : locale === 'kurd' ? 'Facebook' : 'Facebook'}
              delay={0.2}
            />
            <SocialLink
              href="https://www.instagram.com/walid_khalid444"
              icon={Instagram}
              label={locale === 'ar' ? 'انستغرام' : locale === 'kurd' ? 'Instagram' : 'Instagram'}
              delay={0.3}
            />
            <SocialLink
              href="https://www.tiktok.com/@walidkhald0"
              icon={Music2}
              label="TikTok"
              delay={0.4}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
