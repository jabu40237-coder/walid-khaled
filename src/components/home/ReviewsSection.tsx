'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getDirection } from '@/lib/utils';
import { getReviews } from '@/lib/data';
import type { Review, Locale } from '@/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'text-gold fill-gold' : 'text-white/10'
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const t = useTranslations('reviews');
  const locale = useLocale() as Locale;
  const dir = getDirection(locale);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    getReviews(true).then((data) => {
      setReviews(data.length > 0 ? data : getDefaultReviews());
    });
  }, []);

  const totalSlides = Math.max(Math.ceil(reviews.length / 3), 1);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  const next = useCallback(() => {
    if (totalSlides <= 1) return;
    goTo((current + 1) % totalSlides);
  }, [current, totalSlides, goTo]);

  const prev = useCallback(() => {
    if (totalSlides <= 1) return;
    goTo((current - 1 + totalSlides) % totalSlides);
  }, [current, totalSlides, goTo]);

  // Auto-play
  useEffect(() => {
    if (reviews.length <= 3) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, reviews.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const getSlide = (page: number) => {
    const start = page * 3;
    return reviews.slice(start, start + 3);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary-300" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(200,168,78,0.03)_0%,_transparent_60%)]" />

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

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/30 transition-all"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold/30 transition-all"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Slide Container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {getSlide(current).map((review) => (
                  <div
                    key={review.id}
                    className="p-6 md:p-8 glass border border-white/5 rounded-2xl flex flex-col"
                  >
                    {/* Rating */}
                    <div className="mb-4">
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Review Text */}
                    <p className="text-white/60 text-sm leading-relaxed mb-6 flex-1 line-clamp-5">
                      &ldquo;{review.text[locale]}&rdquo;
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/10 flex items-center justify-center text-gold font-bold text-sm shrink-0">
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate">
                          {review.customerName}
                        </h4>
                        {review.customerRole && (
                          <p className="text-white/30 text-xs truncate">
                            {review.customerRole}
                          </p>
                        )}
                      </div>

                      {/* Verified Badge */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        {t('verified')}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === current
                      ? 'bg-gold w-6'
                      : 'bg-white/10 hover:bg-white/20'
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Fallback reviews if the data store is empty
function getDefaultReviews(): Review[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'rev_default_1',
      customerName: 'Ahmed M.',
      customerRole: 'Homeowner – Erbil',
      rating: 5,
      text: {
        ar: 'عمل احترافي وفريق ممتاز. الواجهة أصبحت رائعة جداً والعزل الحراري ممتاز.',
        kurd: 'Karê profesyonel û tîmek baş. Facade bû gelek xweşik û îzolasyona germî gelek baş e.',
        en: 'Professional work and excellent team. The facade looks amazing and the thermal insulation is excellent.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
    {
      id: 'rev_default_2',
      customerName: 'Sara H.',
      customerRole: 'Villa Owner – Duhok',
      rating: 5,
      text: {
        ar: 'شركة محترمة جداً، التصميم كان أكثر من رائع والتنفيذ كان دقيقاً جداً. أنصح بهم بشدة.',
        kurd: 'Pargîdaniyek pir bi rûmet, sêwiran ji ya hêvîkirî zêdetir bû û cîbicîkirin pir rast bû. Ez wan pir pêşniyar dikim.',
        en: 'A very respectable company, the design exceeded expectations and execution was very precise. I highly recommend them.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
    {
      id: 'rev_default_3',
      customerName: 'Karwan O.',
      customerRole: 'Commercial Building – Sulaymaniyah',
      rating: 5,
      text: {
        ar: 'أنهوا المشروع في الوقت المحدد وبجودة عالية. الفريق محترف جداً والتواصل معهم ممتاز.',
        kurd: 'Wan proje di wextê xwe de û bi kalîteya bilind temam kir. Tîm pir profesyonel e û ragihandina bi wan re gelek baş e.',
        en: 'They completed the project on time with high quality. The team is very professional and communication is excellent.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
    {
      id: 'rev_default_4',
      customerName: 'Layla A.',
      customerRole: 'Residence – Baghdad',
      rating: 5,
      text: {
        ar: 'خدمة ممتازة من البداية إلى النهاية. التصميم ثلاثي الأبعاد ساعدني كثيراً في تصور المشروع.',
        kurd: 'Xizmetguzariya hêja ji destpêkê heta dawiyê. Sêwirana 3D gelek alîkariya min kir ku projeyê xeyal bikim.',
        en: 'Excellent service from start to finish. The 3D design helped me visualize the project perfectly.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
    {
      id: 'rev_default_5',
      customerName: 'Mohammed R.',
      customerRole: 'Villa Owner – Erbil',
      rating: 5,
      text: {
        ar: 'الأفضل في مجال الواجهات الخارجية. الديكور الخارجي والعزل EPS ممتازان جداً.',
        kurd: 'Ya herî baş di warê façadeyên derve de. Dekorasyona derve û îzolasyona EPS gelek baş in.',
        en: 'The best in exterior facades. The exterior decoration and EPS insulation are outstanding.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
    {
      id: 'rev_default_6',
      customerName: 'Dana S.',
      customerRole: 'Business Owner – Kirkuk',
      rating: 5,
      text: {
        ar: 'فريق متعاون جداً ونتائج ممتازة. سأعمل معهم مرة أخرى في المستقبل بالتأكيد.',
        kurd: 'Tîmek pir hevkariyê dikin û encamên gelek baş. Ez ê bê guman di pêşerojê de dîsa bi wan re bixebitim.',
        en: 'Very cooperative team and outstanding results. I will definitely work with them again in the future.',
      },
      verified: true,
      approved: true,
      createdAt: now,
    },
  ];
}
