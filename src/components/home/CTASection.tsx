'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MessageCircle, Phone, FileText } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export function CTASection() {
  const t = useTranslations('hero');
  const ct = useTranslations('contact');
  const cm = useTranslations('common');

  const whatsappNumber = '07507669742';
  const phoneNumber = '07507669742';

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-300 via-primary-400 to-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(200,168,78,0.08)_0%,_transparent_70%)]" />

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 10% 20%, #C8A84E 1px, transparent 1px),
                           radial-gradient(circle at 90% 80%, #C8A84E 1px, transparent 1px),
                           radial-gradient(circle at 50% 50%, #C8A84E 1px, transparent 1px)`,
          backgroundSize: '80px 80px, 100px 100px, 120px 120px',
        }}
      />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gold-gradient" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gold-gradient" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 lg:px-16 text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="accent-line mx-auto" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="section-heading text-balance mb-6"
        >
          {t('headline')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="section-subheading text-center mx-auto mb-10"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
        >
          {/* WhatsApp */}
          <a
            href={getWhatsAppLink(whatsappNumber, t('subtitle'))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-base !px-8 !py-4 gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            {ct('whatsapp_button')}
          </a>

          {/* Call Now */}
          <a
            href={`tel:${phoneNumber}`}
            className="btn-outline text-base !px-8 !py-4 gap-3"
          >
            <Phone className="w-5 h-5" />
            {ct('call_now')}
          </a>

          {/* Send Request */}
          <a
            href={`#consultation`}
            className="btn-ghost text-base !px-8 !py-4 gap-3"
          >
            <FileText className="w-5 h-5" />
            {ct('request_consultation')}
          </a>
        </motion.div>

        {/* No-price note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/20 text-sm mt-8"
        >
          {cm('no_price')}
        </motion.p>
      </div>
    </section>
  );
}
