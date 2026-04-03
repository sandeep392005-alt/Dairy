'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminOrders, updateOrderStatus } from '../../lib/api';
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthContext';

const ORDER_STATUSES = ['Pending', 'Out for Delivery', 'Delivered'];

function formatItems(items) {
  return items
    .map((item) => `${item.product_name} x ${item.quantity} (Rs ${Number(item.line_total).toFixed(2)})`)
    .join(', ');
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useSupabaseAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() || '';
  const userEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = Boolean(adminEmail && userEmail && userEmail === adminEmail);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getAdminOrders(session?.access_token);
        setOrders(data);
      } catch (apiError) {
        setError(apiError.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    }

    if (authLoading) {
      return;
    }

    if (!adminEmail) {
      setError('Admin access is not configured. Set NEXT_PUBLIC_ADMIN_EMAIL.');
      setLoading(false);
      router.replace('/');
      return;
    }

    if (!user || !isAdmin) {
      setLoading(false);
      router.replace('/');
      return;
    }

    fetchOrders();
  }, [adminEmail, authLoading, isAdmin, router, session?.access_token, user]);

  const handleStatusChange = async (orderId, nextStatus) => {
    setUpdatingOrderId(orderId);
    setError('');

    try {
      await updateOrderStatus(orderId, nextStatus, session?.access_token);
      setOrders((prev) =>
        prev.map((order) =>
          order.order_id === orderId
            ? { ...order, order_status: nextStatus }
            : order
        )
      );
    } catch (apiError) {
      setError(apiError.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-stone-700">Loading orders...</p>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-sage/30 bg-white/85 p-6 shadow-soft">
        <h1 className="text-3xl text-meadow">Dairy Orders Dashboard</h1>
        <p className="mt-2 text-sm text-stone-600">
          Track daily orders, customer details, and delivery progress.
        </p>
      </header>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-bark/20 bg-white/95 shadow-soft">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-cream/90 text-left text-bark">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Delivery Address</th>
              <th className="px-4 py-3">Items Ordered</th>
              <th className="px-4 py-3">Total Amount</th>
              <th className="px-4 py-3">Order Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-stone-500" colSpan={7}>
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.order_id} className="border-t border-stone-200 align-top">
                <td className="px-4 py-3 font-semibold text-meadow">#{order.order_id}</td>
                <td className="px-4 py-3">{order.full_name}</td>
                <td className="px-4 py-3">{order.phone_number}</td>
                <td className="px-4 py-3 whitespace-pre-wrap">{order.delivery_address}</td>
                <td className="px-4 py-3 text-stone-700">{formatItems(order.items)}</td>
                <td className="px-4 py-3 font-semibold text-bark">
                  Rs {Number(order.total_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.order_status}
                    onChange={(event) =>
                      handleStatusChange(order.order_id, event.target.value)
                    }
                    disabled={updatingOrderId === order.order_id}
                    className="rounded-lg border border-sage/50 bg-white px-3 py-2 outline-none focus:border-meadow"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
