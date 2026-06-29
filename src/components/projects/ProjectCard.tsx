'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn, getDirection } from '@/lib/utils';
import { MapPin, ArrowUpRight } from 'lucide-react';
import type { Project, Locale } from '@/types';

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  index?: number;
}

const categoryColors: Record<string, string> = {
  residential: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  villas: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  commercial: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  renovation: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'eps-insulation': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  classical: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  modern: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  decorative: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function ProjectCard({ project, locale, index = 0 }: ProjectCardProps) {
  const t = useTranslations('projects');
  const dir = getDirection(locale);

  return (
    <motion.div
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
        href={`/${locale}/projects/${project.id}`}
        className={cn(
          'group block relative rounded-2xl overflow-hidden',
          'border border-white/5 hover:border-gold/40',
          'bg-gradient-to-b from-primary-300 to-primary',
          'transition-all duration-500 ease-luxury',
          'hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10',
          'focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-primary'
        )}
      >
        {/* Cover image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title[locale] || project.title.en}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-primary-300 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-gold">WK</span>
                </div>
                <span className="text-white/30 text-sm">{t('view_project')}</span>
              </div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border',
                categoryColors[project.category] || 'bg-white/10 text-white/70 border-white/20'
              )}
            >
              {project.category.charAt(0).toUpperCase() + project.category.slice(1).replace('-', ' ')}
            </span>
          </div>

          {/* Completion year badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white/70">
            {project.completionYear}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-500 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-xl shadow-gold/30">
                <ArrowUpRight className="w-6 h-6 text-primary" />
              </div>
              <span className="text-white font-medium text-sm tracking-wide uppercase">
                {t('view_project')}
              </span>
            </div>
          </div>
        </div>

        {/* Card content */}
        <div className="p-5">
          {/* Title */}
          <h3
            className={cn(
              'text-lg font-display font-semibold text-white mb-2 line-clamp-1',
              'group-hover:text-gold transition-colors duration-300'
            )}
          >
            {project.title[locale] || project.title.en}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gold/70 shrink-0" />
            <span className="text-sm text-white/50 truncate">
              {project.city}
            </span>
          </div>

          {/* Short description */}
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
            {project.shortDescription?.[locale] || project.description?.[locale] || project.description?.en}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
