'use client';

import { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <article className="enter-up rounded-2xl border border-sage/30 bg-ivory/90 p-4 shadow-soft backdrop-blur-sm">
      <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-cream">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">
            No image available
          </div>
        )}
      </div>

      <h3 className="text-xl text-meadow">{product.name}</h3>
      <p className="mt-1 min-h-[48px] text-sm text-stone-600">{product.description}</p>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-lg font-semibold text-bark">
          Rs {Number(product.price).toFixed(2)}
          <span className="ml-1 text-xs font-medium text-stone-500">/ {product.unit}</span>
        </p>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 rounded-lg border border-sage/50 bg-white px-2 py-1 text-center text-sm outline-none focus:border-meadow"
            aria-label={`Quantity for ${product.name}`}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-meadow px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
