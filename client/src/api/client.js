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

function withQuery(path, params = {}) {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v)));
  const suffix = qs.toString() ? `?${qs}` : '';
  return `${path}${suffix}`;
}

export const api = {
  getStats: (params = {}) => apiFetch(withQuery('/api/stats', params)),
  getDueCards: (params = {}) => apiFetch(withQuery('/api/cards/due', params)),
  getCards: (params = {}) => apiFetch(withQuery('/api/cards', params)),
  createCard: (card) => apiFetch('/api/cards', { method: 'POST', body: JSON.stringify(card) }),
  updateCard: (id, card) => apiFetch(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(card) }),
  deleteCard: (id) => apiFetch(`/api/cards/${id}`, { method: 'DELETE' }),
  reviewCard: (id, quality) => apiFetch(`/api/cards/${id}/review`, { method: 'POST', body: JSON.stringify({ quality }) }),
  getQuiz: (params = {}) => apiFetch(withQuery('/api/quiz', params)),
  startSession: (sessionType) =>
    apiFetch('/api/sessions/start', { method: 'POST', body: JSON.stringify({ session_type: sessionType }) }),
  endSession: (id, cardsReviewed) =>
    apiFetch(`/api/sessions/${id}/end`, { method: 'POST', body: JSON.stringify({ cards_reviewed: cardsReviewed }) })
};

export function endSessionOnUnload(id, cardsReviewed) {
  const credentials = getStoredCredentials();
  if (!credentials) return;
  fetch(`/api/sessions/${id}/end`, {
    method: 'POST',
    keepalive: true,
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards_reviewed: cardsReviewed })
  }).catch(() => {});
}

export { ApiError };
