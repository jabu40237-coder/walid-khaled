'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  LogIn,
  Shield,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface CaptchaData {
  question: string;
  captchaToken: string;
  csrfToken: string;
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // CAPTCHA state
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // Lockout state
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const router = useRouter();

  // ── Check existing session on mount ─────────
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if setup is needed
        const setupRes = await fetch('/api/auth/setup');
        if (setupRes.ok) {
          const setupData = await setupRes.json();
          if (!setupData.configured) {
            router.replace('/admin/setup');
            return;
          }
        }

        const res = await fetch('/api/auth/me');
        if (res.ok) {
          router.replace('/admin');
          return;
        }
      } catch {
        /* network error – proceed to login */
      }
      setChecking(false);
    };
    checkSession();
  }, [router]);

  // ── Load remembered username ────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem('wk_admin_remembered');
      if (remembered) {
        setUsername(remembered);
        setRemember(true);
      }
    }
  }, []);

  // ── Lockout countdown ───────────────────────
  useEffect(() => {
    if (retryAfterSec === null || retryAfterSec <= 0) {
      if (retryAfterSec === 0) {
        setRetryAfterSec(null);
        setError('');
      }
      return;
    }

    const timer = setInterval(() => {
      setRetryAfterSec((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setError('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfterSec]);

  // ── Fetch CAPTCHA ───────────────────────────
  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data: CaptchaData = await res.json();
        setCaptchaData(data);
        setCaptchaAnswer('');
      }
    } catch {
      /* fallback: no CAPTCHA available */
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  // ── Handle submit ───────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (requireCaptcha) {
      if (!captchaAnswer.trim()) {
        setError('Please answer the security question.');
        return;
      }
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        username: username.trim(),
        password,
        remember,
      };

      if (captchaData) {
        body.captchaToken = captchaData.captchaToken;
        body.captchaAnswer = Number(captchaAnswer.trim());
        body.csrfToken = captchaData.csrfToken;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle different error scenarios
        if (res.status === 429) {
          setError(data.error || 'Too many login attempts.');
          if (data.retryAfterSec) {
            setRetryAfterSec(data.retryAfterSec);
          }
          setRequireCaptcha(true);
          setLoading(false);
          return;
        }

        if (data.requireCaptcha) {
          setRequireCaptcha(true);
          setError(data.error || 'CAPTCHA verification required.');
          await fetchCaptcha();
          setLoading(false);
          return;
        }

        if (data.remaining !== undefined) {
          setRemainingAttempts(data.remaining);
        }

        setError(data.error || 'Login failed. Please try again.');

        // Fetch fresh CAPTCHA on each failure when required
        if (requireCaptcha) {
          await fetchCaptcha();
        }

        setLoading(false);
        return;
      }

      // ── Success ──────────────────────────────
      // Save remembered username
      if (typeof window !== 'undefined') {
        if (remember) {
          localStorage.setItem('wk_admin_remembered', username.trim());
        } else {
          localStorage.removeItem('wk_admin_remembered');
        }
      }

      router.push('/admin');
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  // ── Loading spinner ─────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-gold" />
          </motion.div>
          <h1 className="text-xl font-semibold text-white mb-1">
            Walid Khaled
          </h1>
          <p className="text-sm text-white/40">Administrator Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-primary-200/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* ── Error message ────────────────── */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <span className="block mt-1 text-xs text-red-400/60">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </span>
                  )}
                </motion.div>
              )}

              {/* ── Lockout countdown ──────────── */}
              {retryAfterSec !== null && retryAfterSec > 0 && (
                <motion.div
                  key="lockout"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-lg bg-gold/5 border border-gold/10 text-gold-400 text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Too many attempts. Try again in{' '}
                    {Math.ceil(retryAfterSec / 60)} minute
                    {Math.ceil(retryAfterSec / 60) !== 1 ? 's' : ''}.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Username ─────────────────────── */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-white/60 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoFocus
                  autoComplete="username"
                  disabled={retryAfterSec !== null}
                  className="w-full bg-primary/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors disabled:opacity-40"
                />
              </div>
            </div>

            {/* ── Password ─────────────────────── */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-white/60 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={retryAfterSec !== null}
                  className="w-full bg-primary/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ── CAPTCHA ──────────────────────── */}
            <AnimatePresence>
              {requireCaptcha && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm text-white/60 mb-1.5">
                    Security Check
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" />
                      <input
                        type="number"
                        inputMode="numeric"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder={
                          captchaData?.question || 'Loading...'
                        }
                        disabled={captchaLoading || !captchaData}
                        className="w-full bg-primary/50 border border-gold/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gold/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors disabled:opacity-40"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      disabled={captchaLoading}
                      className="p-3 rounded-xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors disabled:opacity-40"
                      aria-label="Refresh CAPTCHA"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          captchaLoading ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {captchaData && (
                    <p className="text-xs text-gold/40 mt-1.5">
                      Answer: {captchaData.question}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Remember Me ──────────────────── */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-primary/50 text-gold focus:ring-gold/30 cursor-pointer"
                />
                <span className="text-sm text-white/40">
                  Remember this device
                </span>
              </label>
            </div>

            {/* ── Submit ────────────────────────── */}
            <button
              type="submit"
              disabled={loading || retryAfterSec !== null}
              className="w-full flex items-center justify-center gap-2 bg-gold text-primary font-semibold rounded-xl py-3 px-4 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          © {new Date().getFullYear()} Walid Khaled. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
