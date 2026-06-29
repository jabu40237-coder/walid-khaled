'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Star,
  MessageSquare,
  HelpCircle,
  Image,
  Settings,
  BarChart3,
  Database,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
  User,
  Clock,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_PING_INTERVAL_MS = 5 * 60 * 1000; // ping every 5 min
const IDLE_WARNING_MS = 60 * 1000; // warn 1 minute before expiry
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

// ──────────────────────────────────────────────
// Sidebar Links
// ──────────────────────────────────────────────
const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/backup', label: 'Backup', icon: Database },
];

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [idleWarning, setIdleWarning] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const isSetupPage = pathname === '/admin/setup';

  // Refs for idle detection
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auth check ──────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoginPage && !isSetupPage) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [isLoginPage, isSetupPage, checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage && !isSetupPage) {
      router.push('/admin/login');
    }
  }, [loading, user, isLoginPage, isSetupPage, router]);

  // Close sidebar/menu on navigation
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // ── Session Ping ────────────────────────────
  useEffect(() => {
    if (isLoginPage || isSetupPage || !user) return;

    // Initial ping
    fetch('/api/auth/ping', { method: 'POST' }).catch(() => {});

    // Periodic ping
    pingTimerRef.current = setInterval(() => {
      fetch('/api/auth/ping', { method: 'POST' })
        .then((res) => {
          if (res.status === 401) {
            setSessionExpired(true);
          }
        })
        .catch(() => {});
    }, SESSION_PING_INTERVAL_MS);

    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [isLoginPage, isSetupPage, user]);

  // ── Idle Detection ──────────────────────────
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleWarning(false);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // Show warning 1 minute before timeout
    idleTimerRef.current = setTimeout(() => {
      const inactiveMs = Date.now() - lastActivityRef.current;
      if (inactiveMs >= IDLE_TIMEOUT_MS - IDLE_WARNING_MS) {
        setIdleWarning(true);
      }

      // Force logout after full timeout
      setTimeout(() => {
        const totalInactiveMs = Date.now() - lastActivityRef.current;
        if (totalInactiveMs >= IDLE_TIMEOUT_MS) {
          handleLogout();
        }
      }, IDLE_WARNING_MS);
    }, IDLE_TIMEOUT_MS - IDLE_WARNING_MS);
  }, []);

  useEffect(() => {
    if (isLoginPage || isSetupPage || !user) return;

    resetIdleTimer();

    const handleActivity = () => resetIdleTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isLoginPage, isSetupPage, user, resetIdleTimer]);

  // ── Session expired handler ─────────────────
  useEffect(() => {
    if (sessionExpired) {
      handleLogout();
    }
  }, [sessionExpired]);

  // ── Logout ──────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    router.push('/admin/login');
  };

  // ── Render: Login / Setup Page (no chrome) ──
  if (isLoginPage || isSetupPage) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(200,168,78,0.2)',
            },
          }}
        />
        {children}
      </>
    );
  }

  // ── Render: Loading ─────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Guard: Not authenticated ────────────────
  if (!user) return null;

  // ── Render: Admin Dashboard ─────────────────
  return (
    <div className="min-h-screen bg-primary text-white flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(200,168,78,0.2)',
          },
        }}
      />

      {/* ── Idle Warning Overlay ──────────────── */}
      <AnimatePresence>
        {idleWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-primary-200 border border-gold/20 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <Clock className="w-12 h-12 text-gold mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Session Expiring
              </h3>
              <p className="text-sm text-white/50 mb-6">
                You have been inactive. Your session will expire in 1 minute
                due to security timeout.
              </p>
              <button
                onClick={() => {
                  setIdleWarning(false);
                  resetIdleTimer();
                }}
                className="w-full bg-gold text-primary font-semibold rounded-xl py-3 hover:bg-gold-400 transition-colors"
              >
                I&apos;m Still Here
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Overlay ────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-primary-300 border-r border-white/5
          transform transition-transform duration-300
          lg:transform-none lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center">
            <span className="text-gold font-bold text-sm">WK</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Walid Khaled</h1>
            <p className="text-[10px] text-white/40">Admin Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/admin' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gold/10 text-gold border border-gold/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="text-[10px] text-white/30 text-center">
            WK Admin v1.0
          </div>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-primary-300 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/70 hover:text-white p-2 -ml-2"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-white/60 hover:text-white p-2 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm hidden sm:block">{user.username}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-primary-200 border border-white/10 rounded-xl shadow-2xl py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-[11px] text-white/40">Administrator</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
