import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../lib/api';

const FIVE_MINUTES = 5 * 60 * 1000;

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: FIVE_MINUTES,
  });
}