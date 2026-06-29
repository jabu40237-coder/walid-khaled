'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { cn, getWhatsAppLink, getDirection } from '@/lib/utils';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const dir = getDirection(locale);
  const sectionRef = useRef<HTMLElement>(null);

  const whatsappNumber = '07507669742';

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      dir={dir}
    >
      {/* Video / Gradient Background Placeholder */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-gold-900/30 via-primary/60 to-primary" />

      {/* Animated overlay particles / subtle texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #C8A84E 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #C8A84E 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full pt-24 pb-16"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="flex flex-col items-center text-center">
          {/* WK Logo */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="relative">
              <div className="text-8xl md:text-9xl lg:text-[10rem] font-display font-bold tracking-[0.05em] select-none">
                <span className="text-white">W</span>
                <span className="text-gold">K</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 md:w-40 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="text-xs md:text-sm text-white/30 tracking-[0.3em] uppercase mt-4">
                Walid Khaled
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="section-heading text-center max-w-4xl text-balance mb-6"
          >
            {t('headline')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-white/50 max-w-3xl text-center leading-relaxed mb-10"
          >
            {t('subtitle')}
          </motion.p>

          {/* Gold accent before buttons */}
          <motion.div variants={fadeUp} className="accent-line mx-auto" />

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center"
          >
            {/* View Projects */}
            <Link
              href={`/${locale}/projects`}
              className={cn(
                'btn-primary text-base !px-8 !py-4 gap-3 group',
              )}
            >
              {t('cta_projects')}
              <ArrowRight className={cn(
                'w-5 h-5 transition-transform duration-300',
                'group-hover:translate-x-1',
                dir === 'rtl' && 'rotate-180 group-hover:-translate-x-1'
              )} />
            </Link>

            {/* Request Consultation */}
            <Link
              href={`/${locale}/consultation`}
              className="btn-outline text-base !px-8 !py-4 gap-3"
            >
              <FileText className="w-5 h-5" />
              {t('cta_consultation')}
            </Link>

            {/* WhatsApp */}
            <a
              href={getWhatsAppLink(whatsappNumber, t('subtitle'))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-base !px-8 !py-4 gap-3"
            >
              <MessageCircle className="w-5 h-5 text-green-400" />
              {t('cta_whatsapp')}
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-xs text-white/20 tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-gold/50"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
