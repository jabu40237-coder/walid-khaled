'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Menu, X, Phone, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import { getDirection } from '@/lib/utils';

const languages = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'kurd', label: 'کوردی', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

export function Navigation({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [locale]);

  const dir = getDirection(locale);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/projects`, label: t('projects') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/faq`, label: t('faq') },
  ];

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-primary/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="text-2xl md:text-3xl font-display font-bold tracking-wider">
              <span className="text-white">W</span>
              <span className="text-gold">K</span>
            </div>
            <span className="hidden md:block text-xs text-white/40 tracking-[0.2em] uppercase">
              Walid Khaled
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm text-white/60 hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label={t('language')}
              >
                <Globe className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 bg-primary/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden min-w-[140px] shadow-xl"
                  >
                    {languages.map((lang) => (
                      <a
                        key={lang.code}
                        href={`/${lang.code}${window.location.pathname.replace(/^\/(ar|kurd|en)/, '')}`}
                        className={`block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                          locale === lang.code ? 'text-gold' : 'text-white/70'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/${lang.code}${window.location.pathname.replace(/^\/(ar|kurd|en)/, '')}`;
                        }}
                      >
                        {lang.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-white/60 hover:text-white transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* CTA */}
            <Link
              href={`/${locale}/consultation`}
              className="hidden md:inline-flex btn-primary text-sm !py-2.5 !px-5"
            >
              {t('consultation')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === 'rtl' ? 300 : -300 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-primary/98 backdrop-blur-xl lg:hidden pt-20"
          >
            <div className="flex flex-col items-center gap-4 p-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-xl text-white/70 hover:text-gold transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href={`/${locale}/consultation`}
                  className="btn-primary mt-4"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('consultation')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
