'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './providers/CartContext';
import { useSupabaseAuth } from './providers/SupabaseAuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/our-farm', label: 'Our Farm' },
  { href: '/contact', label: 'Contact' },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h2l2.5 11.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L22 7H7" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, loading, signInWithGoogle, signOut } = useSupabaseAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Account';

  return (
    <header className="sticky top-0 z-50 border-b border-sage/30 bg-ivory/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-meadow text-sm font-bold text-white">
            PD
          </span>
          <div>
            <p className="font-[Fraunces] text-xl text-meadow">PureDairy</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-soil">Farm to Table</p>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-semibold text-stone-700 transition hover:text-meadow">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/" className="relative rounded-full border border-sage/40 p-2 text-meadow hover:bg-cream">
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bark px-1 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {!user ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => signInWithGoogle()}
              className="rounded-full bg-meadow px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              {loading ? 'Loading...' : 'Login with Google'}
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-sage/40 bg-white px-3 py-1.5"
              >
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.user_metadata.avatar_url} alt={firstName} className="h-7 w-7 rounded-full" />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">
                    {firstName[0]}
                  </span>
                )}
                <span className="text-sm font-semibold text-stone-700">{firstName}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-700 hover:bg-cream"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="rounded-lg border border-sage/40 p-2 text-meadow md:hidden"
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-sage/30 bg-white/95 px-4 py-3 md:hidden">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2 font-medium text-stone-700 hover:bg-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center justify-between">
            <Link href="/" className="relative rounded-full border border-sage/40 p-2 text-meadow">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-bark px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {!user ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => signInWithGoogle()}
                className="rounded-full bg-meadow px-4 py-2 text-sm font-semibold text-white"
              >
                {loading ? 'Loading...' : 'Login with Google'}
              </button>
            ) : (
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
