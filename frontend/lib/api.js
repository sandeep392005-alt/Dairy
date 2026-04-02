const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || '';

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!RAW_API_BASE_URL) {
    return normalizedPath;
  }

  return `${RAW_API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`;
}

async function handleResponse(response) {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.error || message;
    } catch (error) {
      // Keep default message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getProducts() {
  const response = await fetch(buildApiUrl('/api/products'), { cache: 'no-store' });
  return handleResponse(response);
}

export async function createOrder(payload) {
  const response = await fetch(buildApiUrl('/api/orders'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAdminOrders() {
  const response = await fetch(buildApiUrl('/api/admin/orders'), { cache: 'no-store' });
  return handleResponse(response);
}

export async function updateOrderStatus(orderId, orderStatus) {
  const response = await fetch(buildApiUrl(`/api/admin/orders/${orderId}/status`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderStatus }),
  });

  return handleResponse(response);
}
