'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getServices } from '@/lib/data';
import {
  Shield,
  Building2,
  Palette,
  Landmark,
  Paintbrush,
  Wrench,
  Cuboid,
  Eye,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import type { Service, Locale } from '@/types';

interface Props {
  params: { locale: Locale };
}

// Map service icon strings to lucide components
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Building2,
  Palette,
  Landmark,
  Paintbrush,
  Wrench,
  Cuboid,
  Eye,
};

export default function ServicesPage({ params: { locale } }: Props) {
  const t = useTranslations('services');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getServices();
        setServices(data);
      } catch {
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              {t('title')}
            </h1>
            <div className="w-24 h-1 bg-gold rounded-full mx-auto mb-4" />
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10"
          >
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">
                {loading ? '–' : services.length}
              </span>
              <span className="text-sm text-white/40">{t('services_count')}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">1500+</span>
              <span className="text-sm text-white/40">{t('projects_delivered')}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">16+</span>
              <span className="text-sm text-white/40">{t('years_experience')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 md:px-8 lg:px-16 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-8 border border-white/5 bg-primary-300 animate-pulse">
                  <div className="w-16 h-16 rounded-xl bg-white/5 mb-6" />
                  <div className="h-6 w-3/4 bg-white/5 rounded mb-3" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {services.map((service, index) => {
                const IconComponent = iconMap[service.icon] || Shield;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={`/${locale}/services/${service.id}`}
                      className={cn(
                        'group block glass p-6 md:p-8 rounded-2xl',
                        'border border-white/5 hover:border-gold/30',
                        'transition-all duration-500 ease-luxury',
                        'hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10',
                        'focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-primary'
                      )}
                    >
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-gold" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-display font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                        {service.title[locale] || service.title.en}
                      </h3>

                      {/* Description */}
                      <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-6">
                        {service.description[locale] || service.description.en}
                      </p>

                      {/* View more link */}
                      <div className="flex items-center gap-2 text-gold text-sm font-medium">
                        <span>{t('learn_more')}</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 md:px-8 lg:px-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold/10 via-primary-300 to-primary p-8 md:p-12 lg:p-16 text-center border border-gold/10"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-4">
              {t('cta_title')}
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              {t('cta_description')}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-primary font-semibold hover:bg-gold-400 hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 active:scale-95"
            >
              {t('cta_button')}
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
