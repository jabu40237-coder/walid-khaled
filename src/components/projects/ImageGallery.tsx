'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export default function ImageGallery({ images, className }: ImageGalleryProps) {
  const t = useTranslations('projects');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setZoomed(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setZoomed(false);
    document.body.style.overflow = '';
  }, []);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
    setZoomed(false);
  }, [images.length]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': closeLightbox(); break;
        case 'ArrowRight': next(); break;
        case 'ArrowLeft': prev(); break;
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, next, prev, closeLightbox]);

  // Touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) next();
      else prev();
    }
  }, [next, prev]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className={cn('grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4', className)}
      >
        {images.map((image, index) => (
          <motion.button
            key={index}
            onClick={() => openLightbox(index)}
            className={cn(
              'relative group aspect-[4/3] rounded-xl overflow-hidden',
              'border border-white/5 hover:border-gold/30 transition-colors duration-300',
              'focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-primary'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Zoom icon on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
            {/* Image counter badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/70">
              {index + 1}/{images.length}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white/80">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            {currentIndex > 0 && (
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Next button */}
            {currentIndex < images.length - 1 && (
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Zoom toggle */}
            <button
              onClick={() => setZoomed(!zoomed)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-white/80 flex items-center gap-2 transition-colors"
            >
              {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              {zoomed ? 'Fit' : 'Zoom'}
            </button>

            {/* Image */}
            <div
              className={cn(
                'w-full h-full flex items-center justify-center p-8 md:p-16 transition-all duration-500',
                zoomed ? 'overflow-auto' : 'overflow-hidden'
              )}
            >
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                src={images[currentIndex]}
                alt={`Gallery image ${currentIndex + 1}`}
                className={cn(
                  'rounded-lg shadow-2xl transition-all duration-500',
                  zoomed ? 'max-w-none cursor-zoom-out' : 'max-w-full max-h-full object-contain cursor-default'
                )}
                onClick={() => zoomed && setZoomed(false)}
                draggable={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
