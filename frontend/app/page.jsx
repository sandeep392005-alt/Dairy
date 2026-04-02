'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import CheckoutPanel from '../components/CheckoutPanel';
import { getProducts } from '../lib/api';
import { useCart } from '../components/providers/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cartItems, addToCart, clearCart, totalItems } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (apiError) {
        setError(apiError.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const handleAddToCart = (product, quantity) => {
    addToCart(product, quantity);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="enter-up mb-8 rounded-3xl border border-sage/30 bg-white/80 p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-soil">Farm to Home</p>
        <h1 className="mt-2 text-4xl leading-tight text-meadow sm:text-5xl">
          Pure Dairy, Delivered Fresh Every Morning
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
          100% natural milk, butter, buttermilk, curd, and paneer from trusted local
          farmers. No shortcuts. No preservatives. Just honest goodness.
        </p>
        <p className="mt-4 inline-block rounded-full bg-cream px-4 py-2 text-sm font-semibold text-bark">
          Cart Items: {totalItems}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-stone-600">Loading products...</p>
          ) : error ? (
            <p className="text-red-700">{error}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 60}ms` }}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <CheckoutPanel cartItems={cartItems} onClearCart={clearCart} />
        </div>
      </section>
    </main>
  );
}
