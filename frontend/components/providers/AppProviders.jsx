'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './CartContext';
import { SupabaseAuthProvider } from './SupabaseAuthContext';

export default function AppProviders({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <CartProvider>{children}</CartProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}
