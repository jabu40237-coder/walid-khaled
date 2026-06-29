'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Clock,
  ShieldCheck,
  Wrench,
  Sparkles,
  Users,
  MapPin,
  ScanEye,
  Headset,
} from 'lucide-react';

interface FeatureItem {
  key: string;
  icon: React.ElementType;
}

const features: FeatureItem[] = [
  { key: 'experience', icon: Clock },
  { key: 'materials', icon: ShieldCheck },
  { key: 'execution', icon: Wrench },
  { key: 'design', icon: Sparkles },
  { key: 'team', icon: Users },
  { key: 'coverage', icon: MapPin },
  { key: 'detail', icon: ScanEye },
  { key: 'support', icon: Headset },
];

export function WhyUsSection() {
  const t = useTranslations('why_us');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary-300" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(200,168,78,0.04)_0%,_transparent_60%)]" />

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/3 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="accent-line mx-auto" />
          <h2 className="section-heading">{t('title')}</h2>
          <p className="section-subheading text-center mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.key}
              variants={itemVariants}
              className="group relative p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-gold/20 transition-all duration-500"
            >
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-gold/30 to-transparent" />
                <div className="absolute top-0 right-0 h-px w-6 bg-gradient-to-l from-gold/30 to-transparent" />
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/10 group-hover:border-gold/20 group-hover:shadow-md group-hover:shadow-gold/5 transition-all duration-500">
                <feature.icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                {t(feature.key)}
              </h3>

              {/* Subtle description */}
              <p className="text-sm text-white/30 leading-relaxed">
                {t('subtitle')}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
