'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        setSuccessMessage('Check your email for a sign-in link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-stone-950 font-bold text-xl">P</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-white text-2xl font-semibold text-center mb-2">
          Sign in to Pocketed
        </h1>
        <p className="text-stone-400 text-center mb-8">
          Recover your rightful refunds
        </p>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            {/* Password Input */}
            {!useMagicLink && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition"
                  required={!useMagicLink}
                />
              </div>
            )}

            {/* Toggle Magic Link */}
            <div className="flex items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => {
                  setUseMagicLink(!useMagicLink);
                  setPassword('');
                  setError(null);
                }}
                className="text-sm text-amber-400 hover:text-amber-300 transition"
              >
                {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600 text-stone-950 rounded-xl font-semibold py-2 transition disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Signing in...'
                : useMagicLink
                  ? 'Send magic link'
                  : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-stone-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
