'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthContext';

function AuthIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-meadow" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 11V8.8A5 5 0 0 1 12 4a5 5 0 0 1 5 4.8V11" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="8.5" rx="2.5" />
      <path d="M12 14.3v2.1" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.2-4.9 3.2-8.2Z" />
      <path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.2 1.2-3.8 1.2-2.9 0-5.3-2-6.2-4.7H2.1v2.9C3.9 20.9 7.6 23 12 23Z" />
      <path fill="#FBBC05" d="M5.8 13.9c-.2-.7-.4-1.4-.4-1.9s.1-1.3.4-1.9V7.2H2.1A11 11 0 0 0 1 12c0 1.8.4 3.5 1.1 5l3.7-3.1Z" />
      <path fill="#EA4335" d="M12 4.5c1.7 0 3.3.6 4.5 1.7l3.4-3.4A11.6 11.6 0 0 0 12 1C7.6 1 3.9 3.1 2.1 7.2l3.7 2.9C6.7 6.5 9.1 4.5 12 4.5Z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, router, user]);

  const handleAuthAction = async (action) => {
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Enter both email and password.');
      }

      if (action === 'signin') {
        await signInWithEmailPassword(email.trim(), password);
        router.replace('/');
        return;
      }

      const result = await signUpWithEmailPassword(email.trim(), password);
      if (result.session) {
        router.replace('/');
        return;
      }

      setMessage('Account created. Check your email to confirm the signup, then log in.');
    } catch (authError) {
      setError(authError.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(authError.message || 'Google login failed.');
      setSubmitting(false);
    }
  };

  return (
    <main className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(60,117,84,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(182,152,96,0.18),_transparent_30%),linear-gradient(180deg,_#fbf7ef_0%,_#f5efe3_100%)]" />
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="enter-up space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-soil shadow-soft">
            <AuthIcon />
            Account Access
          </span>
          <h1 className="font-[Fraunces] text-4xl leading-tight text-meadow sm:text-5xl">
            Sign in, create an account, or continue with Google.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Use email and password for a quick local account, or keep using Google login if that is easier.
            Your customer record will sync automatically after authentication.
          </p>
          <div className="rounded-2xl border border-sage/30 bg-white/70 p-4 shadow-soft">
            <p className="text-sm font-semibold text-bark">What you get</p>
            <ul className="mt-2 space-y-2 text-sm text-stone-600">
              <li>• Fast checkout with saved customer details</li>
              <li>• Manual email/password sign up</li>
              <li>• Google login still works as before</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-sage/30 bg-white/90 p-6 shadow-soft backdrop-blur-md sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-soil">Welcome</p>
            <h2 className="mt-2 text-2xl font-semibold text-bark">Access your account</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-meadow"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-meadow"
              />
            </label>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {message && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAuthAction('signin')}
                disabled={submitting || loading}
                className="rounded-xl bg-meadow px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleAuthAction('signup')}
                disabled={submitting || loading}
                className="rounded-xl border border-sage/40 bg-cream px-4 py-3 text-sm font-semibold text-bark transition hover:bg-sage/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create Account
              </button>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">OR</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              Login with Google
            </button>

            <p className="text-center text-xs text-stone-500">
              By continuing, you agree to use the dairy store account system for order tracking and checkout.
            </p>
            <p className="text-center text-sm text-stone-600">
              <Link href="/" className="font-semibold text-meadow hover:underline">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
