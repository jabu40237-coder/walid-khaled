'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CalendarDays,
  CheckCircle,
  MapPin,
  Users,
  Shield,
  Cpu,
} from 'lucide-react';

interface TrustItem {
  key: string;
  icon: React.ElementType;
}

const trustItems: TrustItem[] = [
  { key: 'since', icon: CalendarDays },
  { key: 'projects', icon: CheckCircle },
  { key: 'governorates', icon: MapPin },
  { key: 'team', icon: Users },
  { key: 'materials', icon: Shield },
  { key: 'equipment', icon: Cpu },
];

export function TrustSection() {
  const t = useTranslations('trust');

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary-100" />

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
        </motion.div>

        {/* Trust Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.key}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/10 group-hover:border-gold/30 group-hover:shadow-lg group-hover:shadow-gold/5 transition-all duration-500">
                <item.icon className="w-7 h-7 text-gold/70 group-hover:text-gold group-hover:scale-110 transition-all duration-500" />
              </div>

              {/* Label */}
              <p className="text-sm md:text-base text-white font-medium group-hover:text-gold transition-colors duration-300">
                {t(item.key)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
