import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BRAND_CONFIG } from '../config/brand';
import { isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { admin, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (admin) {
      navigate('/admin', { replace: true });
    }
  }, [admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@kuro.cinema');
    setPassword('kuro2026');
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await login('admin@kuro.cinema', 'kuro2026');
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-4 relative select-none">
      {/* Background Japanese Watermark */}
      <div className="absolute opacity-[0.03] text-[260px] font-serif select-none pointer-events-none text-white">
        {BRAND_CONFIG.kanji}
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-ink-900 border border-white/20 flex items-center justify-center font-serif text-xl font-bold text-white group-hover:border-vermilion transition-colors">
              {BRAND_CONFIG.kanji}
            </div>
            <span className="font-sans font-extrabold text-xl tracking-widest text-white">
              {BRAND_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <span className="hanko-stamp">ADMIN ONLY</span>
            <span className="text-xs font-mono text-ink-400 uppercase tracking-widest">
              Security Terminal
            </span>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-ink-900/80 border border-white/15 p-6 sm:p-8 rounded-sm shadow-2xl backdrop-blur-md space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Sign In to Dashboard</h2>
            <p className="text-xs font-mono text-ink-400 mt-1">
              Authorized administrators only. Visitors do not require accounts.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-vermilion-muted/40 border border-vermilion/40 rounded text-xs font-mono text-vermilion flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-mono uppercase tracking-wider text-ink-300">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kuro.cinema"
                  className="w-full pl-9 pr-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-xs font-mono uppercase tracking-wider text-ink-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] font-mono text-ink-400 hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-ink-950 text-white font-mono text-xs border border-white/10 rounded-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {showForgotNotice && (
              <div className="p-3 bg-ink-950 border border-white/10 rounded text-[11px] font-mono text-ink-400">
                To reset the password for a Supabase account, use the Supabase Dashboard Authentication tab or trigger password recovery via Supabase CLI.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-white text-ink-950 hover:bg-ink-100 font-bold text-xs uppercase tracking-widest border border-white transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login is only available without a configured backend. */}
          {!isSupabaseConfigured() && <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-ink-400">
              <span>Testing locally?</span>
              <span className="text-emerald-400">Instant Demo Login</span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={submitting}
              className="w-full py-2 bg-ink-950 hover:bg-ink-800 text-ink-200 border border-white/15 hover:border-white/30 font-mono text-xs tracking-wider rounded-sm transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Demo Admin Login</span>
            </button>

            <div className="text-[10px] font-mono text-ink-500 text-center">
              Demo Credentials: <code>admin@kuro.cinema</code> / <code>kuro2026</code>
            </div>
          </div>}
        </div>

        {/* Return to site */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-mono text-ink-500 hover:text-white transition-colors"
          >
            ← Return to Public Archive
          </Link>
        </div>
      </div>
    </div>
  );
};
