'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFAQs } from '@/lib/data';
import type { FAQ } from '@/types';

function AccordionItem({
  faq,
  locale,
  isOpen,
  onToggle,
  index,
}: {
  faq: FAQ;
  locale: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const question = locale === 'ar' ? faq.question.ar : locale === 'kurd' ? faq.question.kurd : faq.question.en;
  const answer = locale === 'ar' ? faq.answer.ar : locale === 'kurd' ? faq.answer.kurd : faq.answer.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left group"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300',
              isOpen ? 'bg-gold/20 text-gold' : 'bg-white/5 text-white/40 group-hover:text-white/60'
            )}
          >
            <span className="text-sm font-bold">{index + 1}</span>
          </div>
          <h3
            className={cn(
              'text-sm md:text-base font-medium transition-colors duration-300',
              isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
            )}
          >
            {question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-colors duration-300',
              isOpen ? 'text-gold' : 'text-white/30 group-hover:text-white/50'
            )}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 md:px-6 md:pb-6 pl-[calc(3.5rem+1rem)]">
              <div className="text-white/50 text-sm leading-relaxed border-l-2 border-gold/20 pl-4">
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('faq');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFAQs() {
      try {
        const data = await getFAQs();
        setFaqs(data);
      } finally {
        setLoading(false);
      }
    }
    loadFAQs();
  }, []);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter((faq) => {
      const question = locale === 'ar' ? faq.question.ar : locale === 'kurd' ? faq.question.kurd : faq.question.en;
      const answer = locale === 'ar' ? faq.answer.ar : locale === 'kurd' ? faq.answer.kurd : faq.answer.en;
      return question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
    });
  }, [faqs, searchQuery, locale]);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

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
              <HelpCircle className="w-8 h-8 text-gold" />
            </div>
            <h1 className="section-heading text-gradient-gold mb-4">{t('title')}</h1>
            <p className="section-subheading mb-6">{t('subtitle')}</p>
            <div className="accent-line mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="pb-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'ar'
                  ? 'ابحث في الأسئلة...'
                  : locale === 'kurd'
                  ? 'Di pirsan de bigere...'
                  : 'Search questions...'
              }
              className="w-full pl-12 pr-4 py-4 rounded-xl glass border border-white/10 bg-white/[0.02] text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/40 text-sm">
                {locale === 'ar'
                  ? 'لا توجد نتائج مطابقة للبحث'
                  : locale === 'kurd'
                  ? 'Tu encamên lêgerînê nehatin dîtin'
                  : 'No matching results found'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  faq={faq}
                  locale={locale}
                  isOpen={openId === faq.id}
                  onToggle={() => handleToggle(faq.id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
