'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import {
  Shield,
  Building2,
  Palette,
  Landmark,
  Paintbrush,
  Wrench,
  Cuboid,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getServices, getSettings } from '@/lib/data';
import type { Service, Locale } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Building2,
  Palette,
  Landmark,
  Paintbrush,
  Wrench,
  Cuboid,
  Eye,
};

export function ServicesSection() {
  const t = useTranslations('services');
  const locale = useLocale() as Locale;
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
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

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Shield;
            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="group relative"
              >
                <Link
                  href={`/${locale}/services/${service.id}`}
                  className={cn(
                    'block h-full p-6 md:p-8 glass card-hover',
                    'border border-white/5 rounded-2xl',
                    'hover:border-gold/20',
                    'transition-all duration-500'
                  )}
                >
                  {/* Gold glow on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(400px circle at center, rgba(200,168,78,0.06) 0%, transparent 70%)',
                    }}
                  />

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/10 group-hover:border-gold/20 group-hover:shadow-lg group-hover:shadow-gold/5 transition-all duration-500">
                    <Icon className="w-6 h-6 text-gold group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                    {service.title[locale]}
                  </h3>

                  {/* Description */}
                  <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">
                    {service.description[locale]}
                  </p>

                  {/* Learn More */}
                  <span className="inline-flex items-center gap-2 text-sm text-gold/60 group-hover:text-gold transition-colors duration-300 font-medium">
                    {t('learn_more')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
