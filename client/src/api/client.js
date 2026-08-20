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
  endSession: (id, cardsReviewed, correctCount = null) =>
    apiFetch(`/api/sessions/${id}/end`, {
      method: 'POST',
      body: JSON.stringify({ cards_reviewed: cardsReviewed, correct_count: correctCount })
    }),
  getTheoryCourses: () => apiFetch('/api/theory/courses'),
  getTheoryCourse: (id) => apiFetch(`/api/theory/courses/${id}`),
  createTheoryCourse: (course) => apiFetch('/api/theory/courses', { method: 'POST', body: JSON.stringify(course) }),
  updateTheoryCourse: (id, course) => apiFetch(`/api/theory/courses/${id}`, { method: 'PUT', body: JSON.stringify(course) }),
  deleteTheoryCourse: (id) => apiFetch(`/api/theory/courses/${id}`, { method: 'DELETE' }),
  getTheoryBlock: (id) => apiFetch(`/api/theory/blocks/${id}`),
  createTheoryBlock: (courseId, block) =>
    apiFetch(`/api/theory/courses/${courseId}/blocks`, { method: 'POST', body: JSON.stringify(block) }),
  updateTheoryBlock: (id, block) => apiFetch(`/api/theory/blocks/${id}`, { method: 'PUT', body: JSON.stringify(block) }),
  deleteTheoryBlock: (id) => apiFetch(`/api/theory/blocks/${id}`, { method: 'DELETE' }),
  createTheoryItem: (blockId, item) =>
    apiFetch(`/api/theory/blocks/${blockId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  updateTheoryItem: (id, item) => apiFetch(`/api/theory/items/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteTheoryItem: (id) => apiFetch(`/api/theory/items/${id}`, { method: 'DELETE' }),
  getGamificationSummary: () => apiFetch('/api/gamification/summary'),
  getHeatmap: (days = 90) => apiFetch(withQuery('/api/gamification/heatmap', { days })),
  getCumulative: () => apiFetch('/api/gamification/cumulative'),
  getTopicsBreakdown: () => apiFetch('/api/gamification/topics-breakdown'),
  getBadges: () => apiFetch('/api/gamification/badges'),
  getAccuracyTrend: () => apiFetch('/api/gamification/accuracy-trend'),
  getProblemCards: () => apiFetch('/api/gamification/problem-cards'),
  getMilestones: () => apiFetch('/api/gamification/milestones'),
  getWeeklyRecap: () => apiFetch('/api/gamification/weekly-recap'),
  getTheoryTopics: (language) => apiFetch(withQuery('/api/theory', { language })),
  getTheoryThemeLinks: () => apiFetch('/api/theory/theme-links'),
  getTheoryTopic: (slug) => apiFetch(`/api/theory/${slug}`),
  markTheoryTopicRead: (slug) => apiFetch(`/api/theory/${slug}/read`, { method: 'POST' }),
  getKnownCards: (language) => apiFetch(withQuery('/api/cards/known', { language })),
  masterCard: (id) => apiFetch(`/api/cards/${id}/master`, { method: 'POST' }),
  unmasterCard: (id) => apiFetch(`/api/cards/${id}/unmaster`, { method: 'POST' }),
  getBacklogSummary: () => apiFetch('/api/backlog/summary'),
  getBacklogSettings: () => apiFetch('/api/backlog/settings'),
  updateBacklogSettings: (language, newCardsPerDay) =>
    apiFetch('/api/backlog/settings', { method: 'PUT', body: JSON.stringify({ language, new_cards_per_day: newCardsPerDay }) }),
  boostBacklog: (language, count) =>
    apiFetch('/api/backlog/boost', { method: 'POST', body: JSON.stringify({ language, count }) })
};

export function endSessionOnUnload(id, cardsReviewed, correctCount = null) {
  const credentials = getStoredCredentials();
  if (!credentials) return;
  fetch(`/api/sessions/${id}/end`, {
    method: 'POST',
    keepalive: true,
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cards_reviewed: cardsReviewed, correct_count: correctCount })
  }).catch(() => {});
}

export { ApiError };
