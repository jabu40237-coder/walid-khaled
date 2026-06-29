'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export function FloatingButtons({ locale }: { locale: string }) {
  const t = useTranslations('contact');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappNumber = '07507669742';
  const phoneNumber = '07507669742';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3" style={{ direction: 'ltr' }}>
      {/* Back to Top */}
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-gold hover:border-gold/30 transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Phone Call */}
      <motion.a
        href={`tel:${phoneNumber}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-green-600 shadow-lg shadow-green-600/30 flex items-center justify-center text-white"
        aria-label="Call now"
      >
        <Phone className="w-6 h-6" />
      </motion.a>

      {/* WhatsApp */}
      <motion.a
        href={getWhatsAppLink(whatsappNumber, t('success_message'))}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-full bg-green-500 shadow-lg shadow-green-500/30 flex items-center justify-center text-white"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.a>
    </div>
  );
}
