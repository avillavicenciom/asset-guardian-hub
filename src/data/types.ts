export interface StatusCatalog {
  id: number;
  code: string;
  label: string;
  is_terminal: boolean;
}

export interface Department {
  id: number;
  name: string;
}

export interface RepairStatus {
  id: number;
  code: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface User {
  id: number;
  display_name: string;
  email: string | null;
  username: string | null;
  department: string | null;
  site: string | null;
  created_at: string;
  contract_end: string | null;
}

export type Permission =
  | 'assets.create' | 'assets.edit' | 'assets.delete' | 'assets.assign'
  | 'users.create' | 'users.edit' | 'users.delete' | 'users.import'
  | 'repairs.create' | 'repairs.edit' | 'repairs.close'
  | 'settings.view' | 'settings.edit'
  | 'audit.view'
  | 'reports.view' | 'reports.export';

export const ALL_PERMISSIONS: Permission[] = [
  'assets.create', 'assets.edit', 'assets.delete', 'assets.assign',
  'users.create', 'users.edit', 'users.delete', 'users.import',
  'repairs.create', 'repairs.edit', 'repairs.close',
  'settings.view', 'settings.edit',
  'audit.view',
  'reports.view', 'reports.export',
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  'assets.create': 'Crear activos',
  'assets.edit': 'Editar activos',
  'assets.delete': 'Eliminar activos',
  'assets.assign': 'Asignar activos',
  'users.create': 'Crear usuarios',
  'users.edit': 'Editar usuarios',
  'users.delete': 'Eliminar usuarios',
  'users.import': 'Importar usuarios (CSV)',
  'repairs.create': 'Crear reparaciones',
  'repairs.edit': 'Editar reparaciones',
  'repairs.close': 'Cerrar reparaciones',
  'settings.view': 'Ver ajustes',
  'settings.edit': 'Editar ajustes',
  'audit.view': 'Ver auditoría',
  'reports.view': 'Ver reportes',
  'reports.export': 'Exportar reportes',
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: 'Activos', permissions: ['assets.create', 'assets.edit', 'assets.delete', 'assets.assign'] },
  { label: 'Usuarios', permissions: ['users.create', 'users.edit', 'users.delete', 'users.import'] },
  { label: 'Reparaciones', permissions: ['repairs.create', 'repairs.edit', 'repairs.close'] },
  { label: 'Sistema', permissions: ['settings.view', 'settings.edit', 'audit.view', 'reports.view', 'reports.export'] },
];

export interface Operator {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'TECH' | 'READONLY';
  is_active: boolean;
  permissions: Permission[];
}

export type AssetCategory = 'EQUIPO' | 'PERIFERICO';

export type LocationType = 'ALMACEN' | 'OFICINA' | 'DATACENTER' | 'OTRO';

export interface Location {
  id: number;
  country: string;
  site: string;
  center: string;
  location_type: LocationType;
  floor: string | null;
  notes: string | null;
}

export interface Asset {
  id: number;
  asset_tag: string | null;
  serial_number: string;
  sgad: string | null;
  category: AssetCategory;
  type: string;
  brand: string | null;
  model: string | null;
  status_id: number;
  location_id: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AssetStatusHistory {
  id: number;
  asset_id: number;
  from_status_id: number | null;
  to_status_id: number;
  changed_by_operator_id: number;
  reason: string | null;
  changed_at: string;
}

export interface Assignment {
  id: number;
  asset_id: number;
  user_id: number | null;
  manual_user_name: string | null;
  manual_user_email: string | null;
  assigned_at: string;
  returned_at: string | null;
  assigned_by_operator_id: number;
  delivery_mode: 'SIGNED' | 'TECH_VALIDATED';
  delivery_reason_code: string | null;
  delivery_reason_text: string | null;
  delivery_confirmed_at: string | null;
  delivery_pdf_path: string | null;
  delivery_notified_at: string | null;
}

export interface DeliveryEvidence {
  id: number;
  assignment_id: number;
  type: 'PHOTO' | 'EMAIL_CONFIRMATION' | 'DOCUMENT' | 'OTHER';
  file_path: string;
  notes: string | null;
  created_by_operator_id: number;
  created_at: string;
}

export type IncidentType = 'HARDWARE' | 'SOFTWARE' | 'ACCESORIO' | 'PREVENTIVO' | 'OTRO';

export const INCIDENT_TYPES: Record<IncidentType, string> = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  ACCESORIO: 'Accesorio',
  PREVENTIVO: 'Mantenimiento preventivo',
  OTRO: 'Otro',
};

export interface Repair {
  id: number;
  asset_id: number;
  opened_at: string;
  closed_at: string | null;
  provider: string | null;
  ticket_ref: string | null;
  diagnosis: string | null;
  action_performed: string | null;
  incident_type: IncidentType | null;
  is_warranty: boolean;
  repair_status_id: number | null;
  cost: number | null;
  result_status_id: number | null;
  technician_id: number | null;
}

export interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  company: string | null;
  is_external: boolean;
  is_active: boolean;
}

export interface HardwarePart {
  id: number;
  code: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  unit_cost: number | null;
  stock: number;
}

export interface RepairPart {
  id: number;
  repair_id: number;
  part_id: number;
  quantity: number;
  action: 'REPLACED' | 'ADDED' | 'REMOVED';
  notes: string | null;
}

export interface AssetType {
  id: number;
  code: string;
  label: string;
  category: AssetCategory;
}

export interface AssetModel {
  id: number;
  brand: string;
  model: string;
  asset_type_id: number;
  processor: string | null;
  ram_gb: number | null;
  storage: string | null;
  screen_size: string | null;
  os: string | null;
  photo_url: string | null;
  notes: string | null;
}

export type DeliveryReasonCode = 'USER_UNAVAILABLE' | 'URGENT_DELIVERY' | 'NO_ACCESS_TO_SIGN' | 'THIRD_PARTY_AUTHORIZED' | 'OTHER';

export const DELIVERY_REASONS: Record<DeliveryReasonCode, string> = {
  USER_UNAVAILABLE: 'Usuario no disponible',
  URGENT_DELIVERY: 'Entrega urgente',
  NO_ACCESS_TO_SIGN: 'Sin acceso para firmar',
  THIRD_PARTY_AUTHORIZED: 'Tercero autorizado',
  OTHER: 'Otro motivo',
};
