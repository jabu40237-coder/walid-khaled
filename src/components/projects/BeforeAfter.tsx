'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { GripHorizontal } from 'lucide-react';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export default function BeforeAfter({ beforeImage, afterImage, className }: BeforeAfterProps) {
  const t = useTranslations('projects');
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number>(0);
  const targetPos = useRef(50);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const dir = document.documentElement.dir || 'ltr';
    let x = clientX - rect.left;
    if (dir === 'rtl') x = rect.width - x;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    targetPos.current = pct;
    setPosition(pct);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => updatePosition(e.clientX));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => updatePosition(e.touches[0].clientX));
    };

    const handleUp = () => {
      setIsDragging(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchend', handleUp);
    document.addEventListener('touchcancel', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('touchcancel', handleUp);
    };
  }, [isDragging, updatePosition]);

  const sliderWidth = position;
  const isRTL = typeof document !== 'undefined' ? document.documentElement.dir === 'rtl' : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={cn('w-full', className)}
    >
      <div
        ref={containerRef}
        className={cn(
          'relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden',
          'border border-white/5 select-none cursor-col-resize',
          isDragging && 'cursor-grabbing'
        )}
      >
        {/* After image (full width behind) */}
        <img
          src={afterImage}
          alt={t('after')}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Before image (clipped by slider position) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: `${sliderWidth}%`,
            [isRTL ? 'right' : 'left']: 0,
          }}
        >
          <img
            src={beforeImage}
            alt={t('before')}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              width: `${(100 / sliderWidth) * 100}%`,
              minWidth: containerRef.current ? containerRef.current.offsetWidth : 'auto',
            }}
            draggable={false}
          />
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-gold shadow-lg shadow-gold/30 cursor-col-resize z-10"
          style={{ [isRTL ? 'right' : 'left']: `${sliderWidth}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Drag handle circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold border-2 border-primary flex items-center justify-center shadow-2xl shadow-gold/50">
            <GripHorizontal className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs md:text-sm font-medium text-white/80">
          {t('before')}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs md:text-sm font-medium text-gold">
          {t('after')}
        </div>

        {/* Dragging overlay to capture events on the entire container */}
        {isDragging && (
          <div
            className="absolute inset-0 z-20 cursor-grabbing"
            onMouseMove={(e) => updatePosition(e.clientX)}
            onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
          />
        )}
      </div>
    </motion.div>
  );
}
