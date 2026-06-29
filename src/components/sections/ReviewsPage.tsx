'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getReviews } from '@/lib/data';
import type { Review } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4',
            star <= rating ? 'text-gold fill-gold' : 'text-white/15'
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, locale, index }: { review: Review; locale: string; index: number }) {
  const t = useTranslations('reviews');
  const text = locale === 'ar' ? review.text.ar : locale === 'kurd' ? review.text.kurd : review.text.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass p-6 flex flex-col h-full card-hover"
    >
      {/* Rating */}
      <div className="flex items-center justify-between mb-4">
        <StarRating rating={review.rating} />
        {review.verified && (
          <span className="flex items-center gap-1 text-green-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('verified')}
          </span>
        )}
      </div>

      {/* Review Text */}
      <p className="text-white/70 text-sm leading-relaxed flex-1 mb-4 line-clamp-6">
        "{text}"
      </p>

      {/* Project Photo */}
      {review.projectPhoto && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={review.projectPhoto}
            alt="Project"
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Customer Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        {review.customerPhoto ? (
          <img
            src={review.customerPhoto}
            alt={review.customerName}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <User className="w-5 h-5 text-gold" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{review.customerName}</p>
          {review.customerRole && (
            <p className="text-white/40 text-xs truncate">{review.customerRole}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ReviewsPage({ locale }: { locale: string }) {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getReviews(true);
        setReviews(data);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass p-6 animate-pulse">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-4 h-4 rounded bg-white/10" />
                ))}
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-1">
                  <div className="h-3 bg-white/10 rounded w-20" />
                  <div className="h-2 bg-white/10 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-10 h-10 text-gold/50" />
        </div>
        <h3 className="text-xl text-white font-semibold mb-2">{t('no_reviews')}</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          {locale === 'ar'
            ? 'كن أول من يشارك تجربته مع خدماتنا'
            : locale === 'kurd'
            ? 'Bibe yekem kesê ku ezmûna xwe bi me re parve dike'
            : 'Be the first to share your experience with our services'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review, index) => (
        <ReviewCard key={review.id} review={review} locale={locale} index={index} />
      ))}
    </div>
  );
}
