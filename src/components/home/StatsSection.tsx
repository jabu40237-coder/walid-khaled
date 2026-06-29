'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CheckCircle,
  CalendarDays,
  MapPin,
  Award,
  Star,
} from 'lucide-react';

interface StatItem {
  key: string;
  value: number | string;
  suffix: string;
  icon: React.ElementType;
  prefix?: string;
}

function CounterBadge({
  target,
  suffix,
  prefix,
  duration,
  inView,
}: {
  target: number;
  suffix: string;
  prefix?: string;
  duration: number;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    },
    [target, duration]
  );

  useEffect(() => {
    if (inView) {
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, animate]);

  return (
    <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gold tabular-nums">
      {prefix && prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const t = useTranslations('stats');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stats: StatItem[] = [
    { key: 'projects', value: 1500, suffix: '+', icon: CheckCircle },
    { key: 'since', value: 2009, suffix: '', icon: CalendarDays, prefix: '' },
    { key: 'governorates', value: 18, suffix: '', icon: MapPin },
    { key: 'quality', value: 100, suffix: '%', icon: Award },
    { key: 'satisfaction', value: 99, suffix: '%', icon: Star },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary-300" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary-300 to-primary" />

      {/* Gold line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-5 group-hover:border-gold/30 group-hover:shadow-lg group-hover:shadow-gold/5 transition-all duration-500">
                <stat.icon className="w-6 h-6 text-gold/70 group-hover:text-gold transition-colors duration-500" />
              </div>

              {/* Counter / Number */}
              {typeof stat.value === 'number' ? (
                <CounterBadge
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  duration={2}
                  inView={inView}
                />
              ) : (
                <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gold">
                  {stat.value}
                </span>
              )}

              {/* Label */}
              <p className="text-sm md:text-base text-white/40 mt-3 font-medium tracking-wide uppercase">
                {t(stat.key)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gold line bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
