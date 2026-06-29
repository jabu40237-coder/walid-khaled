'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getProject, getProjects } from '@/lib/data';
import ProjectCard from '@/components/projects/ProjectCard';
import ImageGallery from '@/components/projects/ImageGallery';
import VideoGallery from '@/components/projects/VideoGallery';
import BeforeAfter from '@/components/projects/BeforeAfter';
import {
  MapPin,
  Calendar,
  Tag,
  Star,
  ArrowLeft,
  Phone,
  MessageCircle,
  CheckCircle2,
  Lightbulb,
  PenTool,
  Wrench,
  Trophy,
  Quote,
} from 'lucide-react';
import Link from 'next/link';
import type { Project, Locale } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const id = params.id as string;
  const t = useTranslations('projects');

  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(false);
        const data = await getProject(id);
        if (!data) {
          setError(true);
          return;
        }
        setProject(data);

        // Load related projects (same category, excluding current)
        const { projects } = await getProjects({ category: data.category, limit: 3 });
        setRelatedProjects(projects.filter((p) => p.id !== data.id).slice(0, 3));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
          <div className="aspect-[21/9] bg-white/5 rounded-2xl" />
          <div className="h-8 w-2/3 bg-white/5 rounded-lg" />
          <div className="flex gap-4">
            <div className="h-5 w-32 bg-white/5 rounded" />
            <div className="h-5 w-32 bg-white/5 rounded" />
            <div className="h-5 w-32 bg-white/5 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 lg:px-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-4">{t('not_found')}</h2>
          <p className="text-white/40 mb-6">{t('not_found_desc')}</p>
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-primary font-medium hover:bg-gold-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_projects')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 pb-0">
        <div className="relative aspect-[21/9] md:aspect-[21/8] max-w-[1600px] mx-auto overflow-hidden">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title[locale] || project.title.en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary-300 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl font-bold text-gold/20">WK</span>
                <p className="text-white/20 mt-2">{project.title[locale] || project.title.en}</p>
              </div>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />

          {/* Back button */}
          <Link
            href={`/${locale}/projects`}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_projects')}
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 -mt-16 md:-mt-20 relative z-10">
        {/* Project Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass p-6 md:p-8 lg:p-10 rounded-2xl"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            {project.title[locale] || project.title.en}
          </h1>

          {/* Metadata tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              <MapPin className="w-3.5 h-3.5 text-gold/70" />
              {project.city}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
              <Calendar className="w-3.5 h-3.5 text-gold/70" />
              {project.completionYear}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-sm text-gold">
              <Tag className="w-3.5 h-3.5" />
              {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace('-', ' ')}
            </span>
          </div>

          {/* Description */}
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-3xl">
            {project.description[locale] || project.description.en}
          </p>
        </motion.div>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('gallery')}
              </h2>
              <ImageGallery images={project.images} />
            </motion.div>
          </section>
        )}

        {/* Before & After */}
        {project.beforeImages?.[0] && project.afterImages?.[0] && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('before_after')}
              </h2>
              <BeforeAfter
                beforeImage={project.beforeImages[0]}
                afterImage={project.afterImages[0]}
              />
            </motion.div>
          </section>
        )}

        {/* Design Process */}
        {(project.challenges?.[locale] || project.designProcess?.[locale] || project.executionProcess?.[locale]) && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-8">
                {t('design_process_title')}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Challenges */}
                {project.challenges?.[locale] && (
                  <div className="glass p-6 rounded-xl border border-white/5 hover:border-gold/20 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                      <Lightbulb className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-3">{t('challenges')}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {project.challenges[locale] || project.challenges.en}
                    </p>
                  </div>
                )}

                {/* Design */}
                {project.designProcess?.[locale] && (
                  <div className="glass p-6 rounded-xl border border-white/5 hover:border-gold/20 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <PenTool className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-3">{t('design_process')}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {project.designProcess[locale] || project.designProcess.en}
                    </p>
                  </div>
                )}

                {/* Execution */}
                {project.executionProcess?.[locale] && (
                  <div className="glass p-6 rounded-xl border border-white/5 hover:border-gold/20 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Wrench className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-display font-semibold text-white mb-3">{t('execution_process')}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {project.executionProcess[locale] || project.executionProcess.en}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        )}

        {/* Project Highlights */}
        {project.highlights && project.highlights.length > 0 && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('highlights')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm">
                      {h[locale] || h.en}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Materials Used */}
        {project.materials && project.materials.length > 0 && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('materials')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((material, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:border-gold/30 hover:text-gold transition-colors"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Video Gallery */}
        {project.videos && project.videos.length > 0 && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('videos')}
              </h2>
              <VideoGallery videos={project.videos} />
            </motion.div>
          </section>
        )}

        {/* Client Testimonial */}
        {project.clientTestimonial && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="relative glass p-8 md:p-12 rounded-2xl border border-gold/10"
            >
              {/* Quote icon */}
              <div className="absolute -top-5 left-8 w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <p className="text-white/70 text-base md:text-lg leading-relaxed italic mb-4">
                    &ldquo;{project.clientTestimonial.text[locale] || project.clientTestimonial.text.en}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-white font-medium">{project.clientTestimonial.name}</p>
                      <p className="text-white/40 text-sm">{project.clientTestimonial.role}</p>
                    </div>
                  </div>
                </div>
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < project.clientTestimonial!.rating
                          ? 'fill-gold text-gold'
                          : 'fill-none text-white/20'
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="mt-16 pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
                {t('related')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProjects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} locale={locale} index={i} />
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="mt-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold/10 via-primary-300 to-primary p-8 md:p-12 text-center border border-gold/10"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              {t('contact_cta')}
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
              {t('contact_cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-primary font-semibold hover:bg-gold-400 hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 active:scale-95"
              >
                <Phone className="w-4 h-4" />
                {t('contact_us_button')}
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
        </section>
      </div>
    </div>
  );
}
