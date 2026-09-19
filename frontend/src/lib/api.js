const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const error = new Error(body?.error || `request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return body;
}

export const api = {
  register: (email, password) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  linkPresto: (prestoUsername, prestoPassword) =>
    request('/api/presto-links', { method: 'POST', body: JSON.stringify({ prestoUsername, prestoPassword }) }),
  getPrestoLink: () => request('/api/presto-links/me'),
  unlinkPresto: (id) => request(`/api/presto-links/${id}`, { method: 'DELETE' }),
  syncPresto: (id) => request(`/api/presto-links/${id}/sync`, { method: 'POST' }),
};
