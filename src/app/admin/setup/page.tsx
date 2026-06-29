'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Password strength checker
// ──────────────────────────────────────────────
function checkStrength(pw: string): {
  score: number;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: 'At least 8 characters', passed: pw.length >= 8 },
    { label: 'One uppercase letter (A–Z)', passed: /[A-Z]/.test(pw) },
    { label: 'One lowercase letter (a–z)', passed: /[a-z]/.test(pw) },
    { label: 'One number (0–9)', passed: /[0-9]/.test(pw) },
    { label: 'One special character (!@#$…)', passed: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.passed).length;
  return { score, checks };
}

export default function AdminSetupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // State checks
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const router = useRouter();

  // ── Check if setup is needed ────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/setup');
        if (res.ok) {
          const data = await res.json();
          if (!data.configured) {
            setNeedsSetup(true);
            setChecking(false);
            return;
          }
        }
        // Admin already configured — show message then redirect
        setChecking(false);
        setNeedsSetup(false);
      } catch {
        router.replace('/admin/login');
      }
    };
    check();
  }, [router]);

  // ── Handle submit ───────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const strength = checkStrength(password);
    if (strength.score < 3) {
      setError('Password is too weak. It must have at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Setup failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 2500);
    } catch {
      setError('Network error. Please check your connection.');
      setLoading(false);
    }
  };

  // ── Loading state ───────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!needsSetup) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"
          >
            <AlertTriangle className="w-10 h-10 text-gold" />
          </motion.div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Administrator Already Configured
          </h1>
          <p className="text-sm text-white/50 mb-6">
            The administrator account has already been configured. Only one
            administrator account can exist. If you need to reset it, you must
            do so from the server.
          </p>
          <button
            onClick={() => router.replace('/admin/login')}
            className="inline-flex items-center gap-2 bg-gold text-primary font-semibold rounded-xl py-3 px-6 hover:bg-gold-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Success state ───────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Administrator Created
          </h1>
          <p className="text-sm text-white/50 mb-4">
            Your administrator account has been created successfully. Redirecting to the sign-in page…
          </p>
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  // ── Setup form ──────────────────────────────
  const strength = checkStrength(password);
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-400',
    'bg-green-500',
  ];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

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
          <p className="text-sm text-white/40">First-Time Setup</p>
        </div>

        {/* Setup Card */}
        <div className="bg-primary-200/80 backdrop-blur-xl border border-gold/20 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              Create Administrator Account
            </h2>
            <p className="text-sm text-white/40">
              Set up the administrator account for your website. Choose a strong username and password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* ── Error message ────────────────── */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* ── Username ─────────────────────── */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm text-white/60 mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin@example.com"
                  autoFocus
                  autoComplete="off"
                  className="w-full bg-primary/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="w-full bg-primary/50 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
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

              {/* Strength meter */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength.score
                            ? strengthColors[strength.score - 1]
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/30">
                    Strength: {strengthLabels[Math.min(strength.score, 4)]}
                  </p>
                  <div className="space-y-0.5">
                    {strength.checks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        {check.passed ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-white/15" />
                        )}
                        <span
                          className={
                            check.passed ? 'text-green-400/70' : 'text-white/20'
                          }
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Confirm Password ─────────────── */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm text-white/60 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full bg-primary/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* ── Security note ────────────────── */}
            <div className="p-3 rounded-lg bg-gold/5 border border-gold/10">
              <p className="text-xs text-gold-400/70">
                🔒 Your password will be securely hashed using bcrypt and stored locally. Choose a strong, unique password that you will remember. There is only one administrator account.
              </p>
            </div>

            {/* ── Submit ────────────────────────── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold text-primary font-semibold rounded-xl py-3 px-4 hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Create Administrator Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          © {new Date().getFullYear()} Walid Khaled. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
