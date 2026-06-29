'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Home, Building2, Wrench, Sparkles, MapPin, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  icon: React.ReactNode;
  options: { value: string; label: { ar: string; kurd: string; en: string } }[];
}

const questions: Question[] = [
  {
    id: 'projectType',
    icon: <Building2 className="w-5 h-5" />,
    options: [
      { value: 'residential', label: { ar: 'منزل سكني', kurd: 'Xaniyê Niştecîh', en: 'Residential House' } },
      { value: 'villa', label: { ar: 'فيلا فاخرة', kurd: 'Vîlaya Luks', en: 'Luxury Villa' } },
      { value: 'commercial', label: { ar: 'مبنى تجاري', kurd: 'Avahiya Bazirganî', en: 'Commercial Building' } },
      { value: 'renovation', label: { ar: 'ترميم خارجي', kurd: 'Nûjenkirina Derve', en: 'Exterior Renovation' } },
    ],
  },
  {
    id: 'projectSize',
    icon: <Ruler className="w-5 h-5" />,
    options: [
      { value: 'small', label: { ar: 'صغير (أقل من 200 م²)', kurd: 'Biçûk (Kêmtir ji 200 m²)', en: 'Small (Less than 200 m²)' } },
      { value: 'medium', label: { ar: 'متوسط (200 – 500 م²)', kurd: 'Navîn (200 – 500 m²)', en: 'Medium (200 – 500 m²)' } },
      { value: 'large', label: { ar: 'كبير (500 – 1000 م²)', kurd: 'Mezin (500 – 1000 m²)', en: 'Large (500 – 1000 m²)' } },
      { value: 'xlarge', label: { ar: 'كبير جداً (أكثر من 1000 م²)', kurd: 'Pir Mezin (Zêdetirî 1000 m²)', en: 'Very Large (Over 1000 m²)' } },
    ],
  },
  {
    id: 'location',
    icon: <MapPin className="w-5 h-5" />,
    options: [
      { value: 'not_sure', label: { ar: 'لست متأكداً بعد', kurd: 'Hê nebiryar im', en: "I'm not sure yet" } },
      { value: 'kurdistan', label: { ar: 'إقليم كردستان', kurd: 'Herêma Kurdistanê', en: 'Kurdistan Region' } },
      { value: 'baghdad', label: { ar: 'بغداد والمناطق الوسطى', kurd: 'Bexda û Navçeyên Navîn', en: 'Baghdad & Central' } },
      { value: 'south', label: { ar: 'المناطق الجنوبية', kurd: 'Navçeyên Başûr', en: 'Southern Regions' } },
    ],
  },
  {
    id: 'style',
    icon: <Sparkles className="w-5 h-5" />,
    options: [
      { value: 'classical', label: { ar: 'كلاسيكي فاخر', kurd: 'Klasîka Luks', en: 'Luxury Classical' } },
      { value: 'modern', label: { ar: 'حديث معاصر', kurd: 'Modern', en: 'Modern Contemporary' } },
      { value: 'mixed', label: { ar: 'مزيج بين الكلاسيكي والحديث', kurd: 'Têkelî Klasîk û Modern', en: 'Mix of Classical & Modern' } },
      { value: 'unsure', label: { ar: 'أحتاج استشارة للاختيار', kurd: 'Pêdiviya min bi şêwirmendiyê heye', en: 'Need consultation to decide' } },
    ],
  },
];

export function SmartAssistant({ locale }: { locale: string }) {
  const t = useTranslations('consultation');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const getLabel = useCallback((item: { label: { ar: string; kurd: string; en: string } }) => {
    return locale === 'ar' ? item.label.ar : locale === 'kurd' ? item.label.kurd : item.label.en;
  }, [locale]);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setCompleted(true), 400);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setCompleted(false);
  };

  const handleContact = () => {
    router.push(`/${locale}/contact`);
  };

  return (
    <div className="glass p-6 md:p-8">
      <h3 className="text-xl text-white font-semibold mb-2">{t('smart_title')}</h3>
      <p className="text-white/50 text-sm mb-6">{t('smart_description')}</p>

      {/* Progress */}
      {!completed && (
        <div className="flex gap-1.5 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full flex-1 transition-all duration-500',
                i < currentStep
                  ? 'bg-gold'
                  : i === currentStep
                  ? 'bg-gold/60'
                  : 'bg-white/10'
              )}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={`question-${currentStep}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Question */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                {questions[currentStep].icon}
              </div>
              <p className="text-white/80 text-sm font-medium">
                {t(`smart_q_${questions[currentStep].id}`)}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {questions[currentStep].options.map((option) => {
                const isSelected = answers[questions[currentStep].id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(questions[currentStep].id, option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'relative p-4 rounded-xl border text-left transition-all duration-300',
                      isSelected
                        ? 'border-gold bg-gold/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white/80'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{getLabel(option)}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0"
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation */}
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleBack}
                className="mt-6 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('smart_previous')}
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-4"
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-gold" />
            </div>
            <h4 className="text-lg text-white font-semibold mb-2">
              {t('smart_thanks')}
            </h4>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              {t('smart_result')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleContact} className="btn-primary">
                {t('smart_contact')}
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost text-sm"
              >
                {t('smart_reset')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
