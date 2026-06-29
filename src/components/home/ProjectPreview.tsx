'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Eye, MapPin, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProjects } from '@/lib/data';
import type { Project, Locale } from '@/types';

export function ProjectPreview() {
  const t = useTranslations('projects');
  const locale = useLocale() as Locale;
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects({ featured: true, limit: 6 }).then((result) => {
      setProjects(result.projects);
    });
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

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="group"
              >
                <Link
                  href={`/${locale}/projects/${project.id}`}
                  className="block relative overflow-hidden rounded-2xl border border-white/5 bg-primary-400 h-full"
                >
                  {/* Image / Placeholder */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary-500">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title[locale]}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-300 via-primary-400 to-primary-500">
                        <div className="text-gold/20 text-6xl font-display font-bold">
                          WK
                        </div>
                        <div className="text-white/10 text-xs mt-2 uppercase tracking-widest">
                          Walid Khaled
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-primary font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <Eye className="w-4 h-4" />
                        {t('view_project')}
                      </span>
                    </div>

                    {/* Gold border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ring-1 ring-inset ring-gold/20" />
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    {/* Category */}
                    <div className="flex items-center gap-2 mb-2">
                      <FolderOpen className="w-3.5 h-3.5 text-gold/50" />
                      <span className="text-xs text-gold/60 uppercase tracking-wider">
                        {t('category')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
                      {project.title[locale]}
                    </h3>

                    {/* City */}
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project.city}</span>
                    </div>

                    {/* Short description */}
                    <p className="text-white/40 text-sm mt-3 line-clamp-2 leading-relaxed">
                      {project.shortDescription[locale]}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Placeholder grid when no projects */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-2xl overflow-hidden border border-white/5 bg-primary-400"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary-300 via-primary-400 to-primary-500 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-white/5 rounded skeleton" />
                  <div className="h-5 w-3/4 bg-white/5 rounded skeleton" />
                  <div className="h-3 w-1/2 bg-white/5 rounded skeleton" />
                  <div className="h-4 w-full bg-white/5 rounded skeleton mt-2" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href={`/${locale}/projects`}
            className="btn-outline text-base !px-10 !py-4 gap-3 group"
          >
            {t('view_all')}
            <ArrowRight className={cn(
              'w-5 h-5 transition-transform duration-300',
              'group-hover:translate-x-1',
            )} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
