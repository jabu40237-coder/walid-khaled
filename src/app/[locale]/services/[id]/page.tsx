'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getService, getProjects } from '@/lib/data';
import ProjectCard from '@/components/projects/ProjectCard';
import {
  CheckCircle2,
  ArrowLeft,
  Phone,
  MessageCircle,
  Shield,
  Building2,
  Palette,
  Landmark,
  Paintbrush,
  Wrench,
  Cuboid,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Service, Project, Locale } from '@/types';

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

export default function ServiceDetailPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const id = params.id as string;
  const t = useTranslations('services');

  const [service, setService] = useState<Service | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(false);
        const data = await getService(id);
        if (!data) {
          setError(true);
          return;
        }
        setService(data);

        // Load some projects as "related" for the service
        const { projects } = await getProjects({ limit: 3 });
        setRelatedProjects(projects);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const IconComponent = service ? (iconMap[service.icon] || Shield) : Shield;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto animate-pulse space-y-8">
          <div className="w-20 h-20 rounded-xl bg-white/5" />
          <div className="h-10 w-2/3 bg-white/5 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-4">{t('not_found')}</h2>
          <p className="text-white/40 mb-6">{t('not_found_desc')}</p>
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-primary font-medium hover:bg-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_services')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_services')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 ring-1 ring-gold/20">
              <IconComponent className="w-10 h-10 text-gold" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              {service.title[locale] || service.title.en}
            </h1>
            <div className="w-20 h-1 bg-gold rounded-full mb-6" />

            {/* Description */}
            <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl">
              {service.description[locale] || service.description.en}
            </p>

            {/* Long description */}
            {service.longDescription?.[locale] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 glass p-6 md:p-8 rounded-2xl"
              >
                <h2 className="text-xl font-display font-semibold text-white mb-4">{t('about_service')}</h2>
                <p className="text-white/50 text-base leading-relaxed">
                  {service.longDescription[locale] || service.longDescription.en}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      {service.features && service.features.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('features')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-white/5 hover:border-gold/20 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">
                      {feature[locale] || feature.en}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Service Image */}
      {service.image && (
        <section className="px-4 md:px-8 lg:px-16 pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden border border-white/5"
            >
              <img
                src={service.image}
                alt={service.title[locale] || service.title.en}
                className="w-full h-auto object-cover aspect-video"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 pb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('related_projects')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} locale={locale} index={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="px-4 md:px-8 lg:px-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold/10 via-primary-300 to-primary p-8 md:p-12 text-center border border-gold/10"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              {t('cta_title')}
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              {t('cta_description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-primary font-semibold hover:bg-gold-400 hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                {t('cta_button')}
              </a>
              <a
                href={`https://wa.me/9647507669742`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-gold/30 text-gold font-medium hover:bg-gold hover:text-primary transition-all duration-300 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
