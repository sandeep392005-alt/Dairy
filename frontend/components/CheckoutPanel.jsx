'use client';

import { useMemo, useState } from 'react';
import { createOrder } from '../lib/api';

export default function CheckoutPanel({ cartItems, onClearCart }) {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    deliveryAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const orderTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cartItems]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!cartItems.length) {
      setError('Your cart is empty. Add products to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          deliveryAddress: form.deliveryAddress,
        },
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(payload);
      setMessage(`Order #${response.order.id} placed successfully.`);
      setForm({ fullName: '', phoneNumber: '', deliveryAddress: '' });
      onClearCart();
    } catch (apiError) {
      setError(apiError.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-bark/20 bg-white/90 p-5 shadow-soft">
      <h2 className="text-2xl text-bark">Cart & Checkout</h2>

      <ul className="mt-4 space-y-2">
        {cartItems.length === 0 ? (
          <li className="text-sm text-stone-600">No items in cart yet.</li>
        ) : (
          cartItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-cream/60 px-3 py-2 text-sm"
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="font-semibold text-meadow">
                Rs {(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </span>
            </li>
          ))
        )}
      </ul>

      <p className="mt-4 text-lg font-semibold text-bark">
        Total: Rs {orderTotal.toFixed(2)}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-sage/50 px-3 py-2 outline-none focus:border-meadow"
          required
        />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-sage/50 px-3 py-2 outline-none focus:border-meadow"
          required
        />
        <textarea
          name="deliveryAddress"
          placeholder="Detailed Delivery Address"
          value={form.deliveryAddress}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded-lg border border-sage/50 px-3 py-2 outline-none focus:border-meadow"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-bark px-4 py-2 font-semibold text-white transition hover:bg-amber-900 disabled:opacity-70"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>

      {message && <p className="mt-3 text-sm font-medium text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </section>
  );
}
