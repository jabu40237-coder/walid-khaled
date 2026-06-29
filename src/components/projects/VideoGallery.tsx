'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Play, X } from 'lucide-react';

interface VideoGalleryProps {
  videos: string[];
  className?: string;
}

export default function VideoGallery({ videos, className }: VideoGalleryProps) {
  const t = useTranslations('projects');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState('');

  const openModal = useCallback((videoUrl: string) => {
    setActiveVideo(videoUrl);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActiveVideo('');
    document.body.style.overflow = '';
  }, []);

  // Close on escape
  useEffect(() => {
    if (!modalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen, closeModal]);

  // Close on click outside video
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  }, [closeModal]);

  // Extract YouTube/Vimeo video ID and build embed URL
  const getEmbedUrl = (url: string): string => {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    // Direct video file (mp4, webm, etc.)
    if (/\.(mp4|webm|ogg|mov)$/i.test(url)) return url;

    // Assume it's an embeddable URL
    return url;
  };

  // Generate thumbnail from video URL (for YouTube videos)
  const getThumbnail = (url: string): string => {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return '';

    // No thumbnail for direct videos — show play overlay
    return '';
  };

  const isDirectVideo = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <>
      {/* Video Thumbnail Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}
      >
        {videos.map((video, index) => {
          const thumb = getThumbnail(video);
          return (
            <motion.button
              key={index}
              onClick={() => openModal(video)}
              className={cn(
                'relative group aspect-video rounded-xl overflow-hidden',
                'border border-white/5 hover:border-gold/30 transition-colors duration-300',
                'focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-primary'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={`Video ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-primary-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-gold translate-x-0.5" />
                    </div>
                    <span className="text-sm text-white/50">
                      {isDirectVideo(video) ? t('video') : t('video')} {index + 1}
                    </span>
                  </div>
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold flex items-center justify-center shadow-2xl shadow-gold/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-primary translate-x-0.5" />
                </motion.div>
              </div>

              {/* Video index badge */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white/70">
                #{index + 1}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {modalOpen && activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Video player */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
            >
              {isDirectVideo(activeVideo) ? (
                <video
                  src={activeVideo}
                  controls
                  autoPlay
                  className="w-full h-full"
                  playsInline
                >
                  <track kind="captions" />
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(activeVideo)}
                  title="Video player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
