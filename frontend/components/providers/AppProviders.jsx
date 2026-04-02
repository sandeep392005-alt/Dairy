'use client';

import { CartProvider } from './CartContext';
import { SupabaseAuthProvider } from './SupabaseAuthContext';

export default function AppProviders({ children }) {
  return (
    <SupabaseAuthProvider>
      <CartProvider>{children}</CartProvider>
    </SupabaseAuthProvider>
  );
}
