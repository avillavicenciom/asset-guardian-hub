const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { name: string; email: string; username: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Generic CRUD
  getAll: <T>(resource: string) => request<T[]>(`/${resource}`),
  getById: <T>(resource: string, id: number) => request<T>(`/${resource}/${id}`),
  create: <T>(resource: string, data: Partial<T>) =>
    request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: <T>(resource: string, id: number, data: Partial<T>) =>
    request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (resource: string, id: number) =>
    request(`/${resource}/${id}`, { method: 'DELETE' }),

  // Dashboard
  dashboardStats: () => request<Record<string, number>>('/dashboard/stats'),

  // Asset-specific
  assetAssignments: (assetId: number) => request(`/assets/${assetId}/assignments`),
  assetStatusHistory: (assetId: number) => request(`/assets/${assetId}/status-history`),
  assetRepairs: (assetId: number) => request(`/assets/${assetId}/repairs`),

  // Health
  health: () => request<{ status: string; database: string }>('/health'),
};
