'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn, governorates, projectCategories } from '@/lib/utils';
import { getProjects } from '@/lib/data';
import ProjectCard from '@/components/projects/ProjectCard';
import { Search, Filter, X, SlidersHorizontal, Building2 } from 'lucide-react';
import type { Project, Locale } from '@/types';

interface Props {
  params: { locale: Locale };
}

const FEATURED_CATEGORIES = [
  'residential',
  'villas',
  'commercial',
  'renovation',
  'eps-insulation',
  'classical',
  'modern',
  'decorative',
] as const;

export default function ProjectsPage({ params: { locale } }: Props) {
  const t = useTranslations('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeGovernorate, setActiveGovernorate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load projects
  useEffect(() => {
    async function load() {
      try {
        const { projects: data } = await getProjects();
        setProjects(data);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter projects
  const filtered = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      const s = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.title[locale] || p.title.en || '').toLowerCase().includes(s) ||
          (p.description[locale] || p.description.en || '').toLowerCase().includes(s) ||
          (p.city || '').toLowerCase().includes(s)
      );
    }

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (activeGovernorate) {
      result = result.filter((p) => p.governorate === activeGovernorate);
    }

    return result;
  }, [projects, search, activeCategory, activeGovernorate, locale]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setActiveCategory('');
    setActiveGovernorate('');
  }, []);

  const hasActiveFilters = search || activeCategory || activeGovernorate;

  const categoryLabel = useCallback(
    (cat: string) => {
      return projectCategories[cat]?.[locale] || projectCategories[cat]?.en || cat;
    },
    [locale]
  );

  const governorateOptions = useMemo(
    () =>
      Object.entries(governorates)
        .filter(([key]) => {
          // Only show governorates that have projects
          return projects.some((p) => p.governorate === key);
        })
        .map(([key, val]) => ({
          key,
          label: val[locale] || val.en,
        })),
    [projects, locale]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-4 md:px-8 lg:px-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
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
            className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-10 text-center"
          >
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">
                {filtered.length}
              </span>
              <span className="text-sm text-white/40">
                {filtered.length === 1 ? t('project_count_singular') : t('project_count')}
              </span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">
                {governorateOptions.length}
              </span>
              <span className="text-sm text-white/40">{t('governorates_covered')}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <span className="block text-3xl md:text-4xl font-bold text-gold">
                {new Set(projects.map((p) => p.category)).size}
              </span>
              <span className="text-sm text-white/40">{t('categories_count')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-[72px] z-30 bg-primary/90 backdrop-blur-xl border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-4">
          {/* Search bar + mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Governorate filter */}
            <select
              value={activeGovernorate}
              onChange={(e) => setActiveGovernorate(e.target.value)}
              className="hidden md:block px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-gold/40 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="" className="bg-primary text-white">{t('filter_by_governorate')}</option>
              {governorateOptions.map((g) => (
                <option key={g.key} value={g.key} className="bg-primary text-white">
                  {g.label}
                </option>
              ))}
            </select>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                showFilters
                  ? 'bg-gold text-primary'
                  : 'bg-white/5 border border-white/10 text-white/70'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('filters')}
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-gold/70 hover:text-gold transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                {t('clear_filters')}
              </button>
            )}
          </div>

          {/* Category filter pills + mobile governorate */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Mobile governorate dropdown */}
                <div className="md:hidden pt-3">
                  <select
                    value={activeGovernorate}
                    onChange={(e) => setActiveGovernorate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-gold/40"
                  >
                    <option value="" className="bg-primary text-white">{t('filter_by_governorate')}</option>
                    {governorateOptions.map((g) => (
                      <option key={g.key} value={g.key} className="bg-primary text-white">
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category filter pills - always visible on desktop */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveCategory('')}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-300',
                activeCategory === ''
                  ? 'bg-gold text-primary border-gold shadow-lg shadow-gold/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80'
              )}
            >
              {t('all')}
            </button>
            {FEATURED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-300',
                  activeCategory === cat
                    ? 'bg-gold text-primary border-gold shadow-lg shadow-gold/20'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white/80'
                )}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 md:px-8 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-white/5 bg-primary-300 animate-pulse">
                  <div className="aspect-[4/3] bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-white/5 rounded" />
                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">{t('no_projects')}</h3>
              <p className="text-white/40 mb-6">{t('no_projects_desc')}</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full bg-gold text-primary text-sm font-medium hover:bg-gold-400 transition-colors"
              >
                {t('clear_filters')}
              </button>
            </motion.div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    locale={locale}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 md:px-8 lg:px-16 pb-20">
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
