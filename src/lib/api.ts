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

// Audit callback - set by AuthContext
let _auditCallback: ((action: string, module: string, details: string) => void) | null = null;

export function setAuditCallback(cb: ((action: string, module: string, details: string) => void) | null) {
  _auditCallback = cb;
}

const RESOURCE_LABELS: Record<string, string> = {
  'assets': 'Activos',
  'users': 'Usuarios',
  'assignments': 'Asignaciones',
  'repairs': 'Reparaciones',
  'operators': 'Operadores',
  'technicians': 'Técnicos',
  'statuses': 'Estados',
  'asset-types': 'Tipos de Activo',
  'asset-models': 'Modelos',
  'locations': 'Ubicaciones',
  'hardware-parts': 'Repuestos',
  'departments': 'Departamentos',
  'repair-statuses': 'Estados de Reparación',
  'repair-parts': 'Piezas de Reparación',
};

function auditCrud(action: string, resource: string, details?: string) {
  if (!_auditCallback) return;
  if (resource === 'audit-log') return; // Don't audit the audit itself
  const module = RESOURCE_LABELS[resource] || resource;
  _auditCallback(action, module, details || `${action} en ${module}`);
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { name: string; email: string; username: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Generic CRUD with auto-audit
  getAll: <T>(resource: string) => request<T[]>(`/${resource}`),
  getById: <T>(resource: string, id: number) => request<T>(`/${resource}/${id}`),
  create: async <T>(resource: string, data: Partial<T>, auditDetails?: string) => {
    const result = await request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) });
    auditCrud('CREAR', resource, auditDetails || `Registro creado en ${RESOURCE_LABELS[resource] || resource}`);
    return result;
  },
  update: async <T>(resource: string, id: number, data: Partial<T>, auditDetails?: string) => {
    const result = await request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    auditCrud('EDITAR', resource, auditDetails || `Registro #${id} editado en ${RESOURCE_LABELS[resource] || resource}`);
    return result;
  },
  delete: async (resource: string, id: number, auditDetails?: string) => {
    const result = await request(`/${resource}/${id}`, { method: 'DELETE' });
    auditCrud('ELIMINAR', resource, auditDetails || `Registro #${id} eliminado de ${RESOURCE_LABELS[resource] || resource}`);
    return result;
  },

  // Dashboard
  dashboardStats: () => request<Record<string, number>>('/dashboard/stats'),

  // Asset-specific
  assetAssignments: (assetId: number) => request(`/assets/${assetId}/assignments`),
  assetStatusHistory: (assetId: number) => request(`/assets/${assetId}/status-history`),
  assetRepairs: (assetId: number) => request(`/assets/${assetId}/repairs`),

  // Health
  health: () => request<{ status: string; database: string }>('/health'),
};
