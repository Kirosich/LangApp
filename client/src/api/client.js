const CREDENTIALS_KEY = 'langapp_credentials';

export function getStoredCredentials() {
  return localStorage.getItem(CREDENTIALS_KEY);
}

export function setStoredCredentials(username, password) {
  const encoded = btoa(`${username}:${password}`);
  localStorage.setItem(CREDENTIALS_KEY, encoded);
  return encoded;
}

export function clearStoredCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path, options = {}) {
  const credentials = getStoredCredentials();
  const headers = { ...(options.headers || {}) };
  if (credentials) headers.Authorization = `Basic ${credentials}`;
  if (options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    clearStoredCredentials();
    throw new ApiError('Unauthorized', 401);
  }
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
      if (data?.errors) message = data.errors.join(', ');
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function verifyCredentials(username, password) {
  const encoded = btoa(`${username}:${password}`);
  const res = await fetch('/api/stats', { headers: { Authorization: `Basic ${encoded}` } });
  if (!res.ok) return false;
  setStoredCredentials(username, password);
  return true;
}

export const api = {
  getStats: () => apiFetch('/api/stats'),
  getDueCards: () => apiFetch('/api/cards/due'),
  getCards: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/api/cards${suffix}`);
  },
  createCard: (card) => apiFetch('/api/cards', { method: 'POST', body: JSON.stringify(card) }),
  updateCard: (id, card) => apiFetch(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(card) }),
  deleteCard: (id) => apiFetch(`/api/cards/${id}`, { method: 'DELETE' }),
  reviewCard: (id, quality) => apiFetch(`/api/cards/${id}/review`, { method: 'POST', body: JSON.stringify({ quality }) }),
  getQuiz: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiFetch(`/api/quiz${suffix}`);
  }
};

export { ApiError };
