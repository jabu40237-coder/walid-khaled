'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, MessageSquareText } from 'lucide-react';
import { ReviewsPage as ReviewsGrid } from '@/components/sections/ReviewsPage';

export default function ReviewsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('reviews');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
              <MessageSquareText className="w-8 h-8 text-gold" />
            </div>
            <h1 className="section-heading text-gradient-gold mb-4">{t('title')}</h1>
            <p className="section-subheading mb-6">{t('subtitle')}</p>

            {/* Rating Summary */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-gold fill-gold" />
                ))}
              </div>
              <span className="text-white/50 text-sm ml-2">
                {locale === 'ar'
                  ? 'رضا العملاء ٩٩٪'
                  : locale === 'kurd'
                  ? 'Razîbûna Mişteriyan 99%'
                  : '99% Customer Satisfaction'}
              </span>
            </div>

            <div className="accent-line mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <ReviewsGrid locale={locale} />
        </div>
      </section>
    </div>
  );
}
