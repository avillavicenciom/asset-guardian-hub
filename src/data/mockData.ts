import { StatusCatalog, User, Operator, Asset, Assignment, Repair, AssetStatusHistory, Location, AssetType, AssetModel, Technician, HardwarePart, RepairPart } from './types';

export const statuses: StatusCatalog[] = [
  { id: 1, code: 'DISPONIBLE', label: 'Disponible', is_terminal: false },
  { id: 2, code: 'ASIGNADO', label: 'Asignado', is_terminal: false },
  { id: 3, code: 'EN_REPARACION', label: 'En reparación', is_terminal: false },
  { id: 4, code: 'DANADO_RECUPERABLE', label: 'Dañado (recuperable)', is_terminal: false },
  { id: 5, code: 'DANADO_IRRECUPERABLE', label: 'Dañado (irrecuperable)', is_terminal: true },
  { id: 6, code: 'DONADO', label: 'Donado', is_terminal: true },
  { id: 7, code: 'POR_ASIGNAR', label: 'Por asignar', is_terminal: false },
];

export const locations: Location[] = [
  { id: 1, country: 'España', site: 'Madrid', center: 'Oficina Central' },
  { id: 2, country: 'España', site: 'Barcelona', center: 'Torre Diagonal' },
  { id: 3, country: 'España', site: 'Valencia', center: 'Centro Tecnológico' },
  { id: 4, country: 'España', site: 'Sevilla', center: 'Sede Sur' },
  { id: 5, country: 'México', site: 'CDMX', center: 'Centro Norte' },
];

export const operators: Operator[] = [
  { id: 1, name: 'Carlos Méndez', email: 'carlos@empresa.com', username: 'cmendez', role: 'ADMIN', is_active: true },
  { id: 2, name: 'Laura Sánchez', email: 'laura@empresa.com', username: 'lsanchez', role: 'TECH', is_active: true },
  { id: 3, name: 'Pedro Ruiz', email: 'pedro@empresa.com', username: 'pruiz', role: 'TECH', is_active: true },
];

export const users: User[] = [
  { id: 1, display_name: 'Ana García López', email: 'ana.garcia@empresa.com', username: 'agarcia', department: 'Marketing', site: 'Madrid - Oficina Central', created_at: '2024-01-15T09:00:00', contract_end: '2026-02-22T00:00:00' },
  { id: 2, display_name: 'Miguel Torres Ruiz', email: 'miguel.torres@empresa.com', username: 'mtorres', department: 'Desarrollo', site: 'Madrid - Oficina Central', created_at: '2024-02-01T10:30:00', contract_end: '2026-06-30T00:00:00' },
  { id: 3, display_name: 'Elena Martínez Díaz', email: 'elena.martinez@empresa.com', username: 'emartinez', department: 'RRHH', site: 'Barcelona', created_at: '2024-02-10T08:00:00', contract_end: null },
  { id: 4, display_name: 'Javier Fernández', email: 'javier.f@empresa.com', username: 'jfernandez', department: 'Finanzas', site: 'Madrid - Oficina Central', created_at: '2024-03-05T11:00:00', contract_end: '2025-12-31T00:00:00' },
  { id: 5, display_name: 'Sofía Navarro Pérez', email: 'sofia.navarro@empresa.com', username: 'snavarro', department: 'Desarrollo', site: 'Valencia', created_at: '2024-03-20T09:15:00', contract_end: '2026-03-19T00:00:00' },
  { id: 6, display_name: 'David Romero Gil', email: 'david.romero@empresa.com', username: 'dromero', department: 'Soporte', site: 'Madrid - Oficina Central', created_at: '2024-04-01T14:00:00', contract_end: null },
  { id: 7, display_name: 'Carmen Blanco López', email: 'carmen.blanco@empresa.com', username: 'cblanco', department: 'Dirección', site: 'Madrid - Oficina Central', created_at: '2024-04-15T08:30:00', contract_end: null },
  { id: 8, display_name: 'Roberto Iglesias', email: 'roberto.i@empresa.com', username: 'riglesias', department: 'Comercial', site: 'Sevilla', created_at: '2024-05-01T10:00:00', contract_end: '2026-02-20T00:00:00' },
];

export const assets: Asset[] = [
  // Equipos principales
  { id: 1, asset_tag: 'IT-L001', serial_number: 'SN-DELL-XPS-001', category: 'EQUIPO', type: 'Laptop', brand: 'Dell', model: 'XPS 15 9530', status_id: 2, location_id: 1, notes: null, tags: ['garantía', 'premium'], created_at: '2024-01-10T10:00:00', updated_at: '2024-06-15T14:00:00' },
  { id: 2, asset_tag: 'IT-L002', serial_number: 'SN-LENOVO-T14-002', category: 'EQUIPO', type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14s Gen 4', status_id: 2, location_id: 1, notes: null, tags: ['garantía'], created_at: '2024-01-10T10:00:00', updated_at: '2024-07-01T09:00:00' },
  { id: 3, asset_tag: 'IT-L003', serial_number: 'SN-HP-ELITEBOOK-003', category: 'EQUIPO', type: 'Laptop', brand: 'HP', model: 'EliteBook 840 G10', status_id: 1, location_id: 1, notes: 'Recién formateado', tags: ['reformateado'], created_at: '2024-01-15T11:00:00', updated_at: '2024-08-10T10:00:00' },
  { id: 6, asset_tag: 'IT-L004', serial_number: 'SN-APPLE-MBP-006', category: 'EQUIPO', type: 'Laptop', brand: 'Apple', model: 'MacBook Pro 14" M3', status_id: 2, location_id: 3, notes: null, tags: ['premium', 'desarrollo'], created_at: '2024-03-01T09:00:00', updated_at: '2024-07-20T16:00:00' },
  { id: 7, asset_tag: 'IT-L005', serial_number: 'SN-DELL-LAT-007', category: 'EQUIPO', type: 'Laptop', brand: 'Dell', model: 'Latitude 5540', status_id: 3, location_id: 1, notes: 'Problema con la pantalla', tags: ['urgente'], created_at: '2024-03-15T10:00:00', updated_at: '2024-09-01T11:00:00' },
  { id: 8, asset_tag: 'IT-T001', serial_number: 'SN-SAMSUNG-TAB-008', category: 'EQUIPO', type: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab S9', status_id: 1, location_id: 1, notes: null, tags: [], created_at: '2024-04-01T08:00:00', updated_at: '2024-04-01T08:00:00' },
  { id: 9, asset_tag: 'IT-L006', serial_number: 'SN-LENOVO-X1-009', category: 'EQUIPO', type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11', status_id: 4, location_id: 4, notes: 'Caída accidental, carcasa rota', tags: ['dañado'], created_at: '2024-04-15T09:00:00', updated_at: '2024-09-15T14:00:00' },
  { id: 10, asset_tag: 'IT-D001', serial_number: 'SN-DELL-OPT-010', category: 'EQUIPO', type: 'Desktop', brand: 'Dell', model: 'OptiPlex 7010', status_id: 2, location_id: 1, notes: null, tags: ['dirección'], created_at: '2024-05-01T08:00:00', updated_at: '2024-08-01T10:00:00' },
  { id: 11, asset_tag: 'IT-L007', serial_number: 'SN-HP-PROBOOK-011', category: 'EQUIPO', type: 'Laptop', brand: 'HP', model: 'ProBook 450 G10', status_id: 5, location_id: 1, notes: 'Placa base quemada, sin reparación posible', tags: ['baja'], created_at: '2024-05-15T11:00:00', updated_at: '2024-10-01T09:00:00' },
  { id: 13, asset_tag: 'IT-L008', serial_number: 'SN-ASUS-ZEN-013', category: 'EQUIPO', type: 'Laptop', brand: 'ASUS', model: 'ZenBook 14 OLED', status_id: 1, location_id: 2, notes: null, tags: ['nuevo'], created_at: '2024-06-01T10:00:00', updated_at: '2024-06-01T10:00:00' },
  { id: 15, asset_tag: 'IT-T002', serial_number: 'SN-APPLE-IPAD-015', category: 'EQUIPO', type: 'Tablet', brand: 'Apple', model: 'iPad Air M1', status_id: 1, location_id: 1, notes: null, tags: [], created_at: '2024-07-01T09:00:00', updated_at: '2024-07-01T09:00:00' },
  // Periféricos
  { id: 4, asset_tag: 'IT-M001', serial_number: 'SN-DELL-U2723-004', category: 'PERIFERICO', type: 'Monitor', brand: 'Dell', model: 'UltraSharp U2723QE', status_id: 2, location_id: 1, notes: null, tags: ['4K'], created_at: '2024-02-01T08:00:00', updated_at: '2024-06-15T14:00:00' },
  { id: 5, asset_tag: 'IT-M002', serial_number: 'SN-LG-27UK850-005', category: 'PERIFERICO', type: 'Monitor', brand: 'LG', model: '27UK850-W', status_id: 1, location_id: 2, notes: null, tags: ['4K'], created_at: '2024-02-01T08:00:00', updated_at: '2024-02-01T08:00:00' },
  { id: 12, asset_tag: 'IT-M003', serial_number: 'SN-BENQ-PD2700-012', category: 'PERIFERICO', type: 'Monitor', brand: 'BenQ', model: 'PD2700U', status_id: 6, location_id: null, notes: 'Donado a ONG TechForAll', tags: ['donación'], created_at: '2024-01-01T08:00:00', updated_at: '2024-09-20T15:00:00' },
  { id: 14, asset_tag: 'IT-P001', serial_number: 'SN-HP-LJ-014', category: 'PERIFERICO', type: 'Impresora', brand: 'HP', model: 'LaserJet Pro M404dn', status_id: 2, location_id: 1, notes: null, tags: ['compartido'], created_at: '2024-02-20T08:00:00', updated_at: '2024-06-01T09:00:00' },
  { id: 16, asset_tag: 'IT-H001', serial_number: 'SN-JABRA-EV2-016', category: 'PERIFERICO', type: 'Headset', brand: 'Jabra', model: 'Evolve2 75', status_id: 2, location_id: 1, notes: null, tags: ['bluetooth'], created_at: '2024-03-10T08:00:00', updated_at: '2024-06-15T14:00:00' },
  { id: 17, asset_tag: 'IT-H002', serial_number: 'SN-POLY-VOY-017', category: 'PERIFERICO', type: 'Headset', brand: 'Poly', model: 'Voyager Focus 2', status_id: 1, location_id: 1, notes: null, tags: [], created_at: '2024-03-10T08:00:00', updated_at: '2024-03-10T08:00:00' },
  { id: 18, asset_tag: 'IT-WC001', serial_number: 'SN-LOGI-C920-018', category: 'PERIFERICO', type: 'Webcam', brand: 'Logitech', model: 'C920 HD Pro', status_id: 2, location_id: 1, notes: null, tags: [], created_at: '2024-04-01T08:00:00', updated_at: '2024-07-01T09:00:00' },
  { id: 19, asset_tag: 'IT-WC002', serial_number: 'SN-LOGI-BRIO-019', category: 'PERIFERICO', type: 'Webcam', brand: 'Logitech', model: 'Brio 4K', status_id: 1, location_id: 2, notes: null, tags: ['4K'], created_at: '2024-04-15T08:00:00', updated_at: '2024-04-15T08:00:00' },
  { id: 20, asset_tag: 'IT-DK001', serial_number: 'SN-DELL-WD19-020', category: 'PERIFERICO', type: 'Dock', brand: 'Dell', model: 'WD19S 180W', status_id: 2, location_id: 1, notes: null, tags: [], created_at: '2024-01-15T08:00:00', updated_at: '2024-06-15T14:00:00' },
  { id: 21, asset_tag: 'IT-DK002', serial_number: 'SN-LENOVO-40B0-021', category: 'PERIFERICO', type: 'Dock', brand: 'Lenovo', model: 'ThinkPad USB-C Dock Gen 2', status_id: 1, location_id: 3, notes: null, tags: [], created_at: '2024-02-01T08:00:00', updated_at: '2024-02-01T08:00:00' },
  { id: 22, asset_tag: 'IT-HD001', serial_number: 'SN-WD-MY4T-022', category: 'PERIFERICO', type: 'Disco externo', brand: 'Western Digital', model: 'My Passport 4TB', status_id: 2, location_id: 1, notes: null, tags: ['backup'], created_at: '2024-05-01T08:00:00', updated_at: '2024-08-01T10:00:00' },
  { id: 23, asset_tag: 'IT-HD002', serial_number: 'SN-SAMSUNG-T7-023', category: 'PERIFERICO', type: 'Disco externo', brand: 'Samsung', model: 'T7 Shield 2TB', status_id: 1, location_id: 1, notes: null, tags: [], created_at: '2024-05-15T08:00:00', updated_at: '2024-05-15T08:00:00' },
  { id: 24, asset_tag: 'IT-AD001', serial_number: 'SN-APPLE-ADP-024', category: 'PERIFERICO', type: 'Adaptador', brand: 'Apple', model: 'USB-C Digital AV Multiport', status_id: 2, location_id: 3, notes: null, tags: [], created_at: '2024-03-01T08:00:00', updated_at: '2024-07-20T16:00:00' },
  { id: 25, asset_tag: 'IT-SC001', serial_number: 'SN-FUJI-IX1600-025', category: 'PERIFERICO', type: 'Escáner', brand: 'Fujitsu', model: 'ScanSnap iX1600', status_id: 1, location_id: 1, notes: null, tags: [], created_at: '2024-06-01T08:00:00', updated_at: '2024-06-01T08:00:00' },
];

export const assignments: Assignment[] = [
  { id: 1, asset_id: 1, user_id: 1, manual_user_name: null, manual_user_email: null, assigned_at: '2024-06-15T14:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'USER_UNAVAILABLE', delivery_reason_text: 'Usuario en reunión, equipo dejado en su puesto', delivery_confirmed_at: '2024-06-15T14:30:00', delivery_pdf_path: '/uploads/pdfs/assignment_1.pdf', delivery_notified_at: '2024-06-15T14:35:00' },
  { id: 2, asset_id: 2, user_id: 2, manual_user_name: null, manual_user_email: null, assigned_at: '2024-07-01T09:00:00', returned_at: null, assigned_by_operator_id: 2, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-07-01T09:15:00', delivery_pdf_path: '/uploads/pdfs/assignment_2.pdf', delivery_notified_at: '2024-07-01T09:20:00' },
  { id: 3, asset_id: 4, user_id: 1, manual_user_name: null, manual_user_email: null, assigned_at: '2024-06-15T14:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'USER_UNAVAILABLE', delivery_reason_text: 'Entrega junto con laptop', delivery_confirmed_at: '2024-06-15T14:30:00', delivery_pdf_path: '/uploads/pdfs/assignment_3.pdf', delivery_notified_at: '2024-06-15T14:35:00' },
  { id: 4, asset_id: 6, user_id: 5, manual_user_name: null, manual_user_email: null, assigned_at: '2024-07-20T16:00:00', returned_at: null, assigned_by_operator_id: 3, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-07-20T16:30:00', delivery_pdf_path: '/uploads/pdfs/assignment_4.pdf', delivery_notified_at: '2024-07-20T16:35:00' },
  { id: 5, asset_id: 10, user_id: 7, manual_user_name: null, manual_user_email: null, assigned_at: '2024-08-01T10:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'URGENT_DELIVERY', delivery_reason_text: 'Solicitud urgente de dirección', delivery_confirmed_at: '2024-08-01T10:15:00', delivery_pdf_path: '/uploads/pdfs/assignment_5.pdf', delivery_notified_at: '2024-08-01T10:20:00' },
  { id: 6, asset_id: 14, user_id: null, manual_user_name: 'Recepción Planta 2', manual_user_email: 'recepcion2@empresa.com', assigned_at: '2024-06-01T09:00:00', returned_at: null, assigned_by_operator_id: 2, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'NO_ACCESS_TO_SIGN', delivery_reason_text: 'Equipo compartido instalado en zona común', delivery_confirmed_at: '2024-06-01T09:30:00', delivery_pdf_path: '/uploads/pdfs/assignment_6.pdf', delivery_notified_at: '2024-06-01T09:35:00' },
  { id: 7, asset_id: 3, user_id: 4, manual_user_name: null, manual_user_email: null, assigned_at: '2024-03-01T10:00:00', returned_at: '2024-08-10T10:00:00', assigned_by_operator_id: 1, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-03-01T10:30:00', delivery_pdf_path: '/uploads/pdfs/assignment_7.pdf', delivery_notified_at: '2024-03-01T10:35:00' },
  { id: 8, asset_id: 16, user_id: 1, manual_user_name: null, manual_user_email: null, assigned_at: '2024-06-15T14:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'USER_UNAVAILABLE', delivery_reason_text: 'Entrega junto con laptop', delivery_confirmed_at: '2024-06-15T14:30:00', delivery_pdf_path: null, delivery_notified_at: null },
  { id: 9, asset_id: 18, user_id: 2, manual_user_name: null, manual_user_email: null, assigned_at: '2024-07-01T09:00:00', returned_at: null, assigned_by_operator_id: 2, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-07-01T09:15:00', delivery_pdf_path: null, delivery_notified_at: null },
  { id: 10, asset_id: 20, user_id: 1, manual_user_name: null, manual_user_email: null, assigned_at: '2024-06-15T14:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'TECH_VALIDATED', delivery_reason_code: 'USER_UNAVAILABLE', delivery_reason_text: null, delivery_confirmed_at: '2024-06-15T14:30:00', delivery_pdf_path: null, delivery_notified_at: null },
  { id: 11, asset_id: 22, user_id: 7, manual_user_name: null, manual_user_email: null, assigned_at: '2024-08-01T10:00:00', returned_at: null, assigned_by_operator_id: 1, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-08-01T10:15:00', delivery_pdf_path: null, delivery_notified_at: null },
  { id: 12, asset_id: 24, user_id: 5, manual_user_name: null, manual_user_email: null, assigned_at: '2024-07-20T16:00:00', returned_at: null, assigned_by_operator_id: 3, delivery_mode: 'SIGNED', delivery_reason_code: null, delivery_reason_text: null, delivery_confirmed_at: '2024-07-20T16:30:00', delivery_pdf_path: null, delivery_notified_at: null },
];

export const repairs: Repair[] = [
  { id: 1, asset_id: 7, opened_at: '2024-09-01T11:00:00', closed_at: null, provider: 'TechRepair Madrid S.L.', ticket_ref: 'TR-2024-0891', diagnosis: 'Panel LCD dañado, requiere sustitución completa', cost: null, result_status_id: null, technician_id: 1 },
  { id: 2, asset_id: 9, opened_at: '2024-09-15T14:00:00', closed_at: null, provider: 'ServiciosTI Sevilla', ticket_ref: 'STS-2024-0234', diagnosis: 'Carcasa rota y bisagra dañada. Pendiente presupuesto.', cost: 180.00, result_status_id: null, technician_id: 2 },
];

export const statusHistory: AssetStatusHistory[] = [
  { id: 1, asset_id: 1, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 1, reason: 'Asignado a Ana García López', changed_at: '2024-06-15T14:00:00' },
  { id: 2, asset_id: 2, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 2, reason: 'Asignado a Miguel Torres Ruiz', changed_at: '2024-07-01T09:00:00' },
  { id: 3, asset_id: 3, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 1, reason: 'Asignado a Javier Fernández', changed_at: '2024-03-01T10:00:00' },
  { id: 4, asset_id: 3, from_status_id: 2, to_status_id: 1, changed_by_operator_id: 1, reason: 'Devuelto por Javier Fernández, formateado', changed_at: '2024-08-10T10:00:00' },
  { id: 5, asset_id: 7, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 2, reason: 'Asignado a usuario interno', changed_at: '2024-05-10T09:00:00' },
  { id: 6, asset_id: 7, from_status_id: 2, to_status_id: 3, changed_by_operator_id: 2, reason: 'Problema con la pantalla reportado por usuario', changed_at: '2024-09-01T11:00:00' },
  { id: 7, asset_id: 9, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 3, reason: 'Asignado a Roberto Iglesias', changed_at: '2024-06-01T10:00:00' },
  { id: 8, asset_id: 9, from_status_id: 2, to_status_id: 4, changed_by_operator_id: 3, reason: 'Caída accidental durante transporte', changed_at: '2024-09-15T14:00:00' },
  { id: 9, asset_id: 11, from_status_id: 1, to_status_id: 3, changed_by_operator_id: 1, reason: 'Fallo eléctrico detectado', changed_at: '2024-08-15T09:00:00' },
  { id: 10, asset_id: 11, from_status_id: 3, to_status_id: 5, changed_by_operator_id: 1, reason: 'Diagnóstico: placa base irreparable', changed_at: '2024-10-01T09:00:00' },
  { id: 11, asset_id: 12, from_status_id: 1, to_status_id: 6, changed_by_operator_id: 1, reason: 'Donación aprobada por dirección', changed_at: '2024-09-20T15:00:00' },
  { id: 12, asset_id: 6, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 3, reason: 'Asignado a Sofía Navarro Pérez', changed_at: '2024-07-20T16:00:00' },
  { id: 13, asset_id: 10, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 1, reason: 'Asignado a Carmen Blanco López', changed_at: '2024-08-01T10:00:00' },
  { id: 14, asset_id: 4, from_status_id: 1, to_status_id: 2, changed_by_operator_id: 1, reason: 'Asignado a Ana García López', changed_at: '2024-06-15T14:00:00' },
];

export function getStatusById(id: number): StatusCatalog | undefined {
  return statuses.find(s => s.id === id);
}

export function getStatusByCode(code: string): StatusCatalog | undefined {
  return statuses.find(s => s.code === code);
}

export function getUserById(id: number): User | undefined {
  return users.find(u => u.id === id);
}

export function getOperatorById(id: number): Operator | undefined {
  return operators.find(o => o.id === id);
}

export function getAssetById(id: number): Asset | undefined {
  return assets.find(a => a.id === id);
}

export function getLocationById(id: number): Location | undefined {
  return locations.find(l => l.id === id);
}

export function getStatusClass(code: string): string {
  const map: Record<string, string> = {
    DISPONIBLE: 'status-available',
    ASIGNADO: 'status-assigned',
    EN_REPARACION: 'status-repair',
    DANADO_RECUPERABLE: 'status-damaged',
    DANADO_IRRECUPERABLE: 'status-irreparable',
    DONADO: 'status-donated',
    POR_ASIGNAR: 'status-pending',
  };
  return map[code] || '';
}

export function getActiveAssignmentForAsset(assetId: number): Assignment | undefined {
  return assignments.find(a => a.asset_id === assetId && !a.returned_at);
}

export function getAssignedUserName(assetId: number): string | null {
  const assignment = getActiveAssignmentForAsset(assetId);
  if (!assignment) return null;
  if (assignment.user_id) {
    const user = getUserById(assignment.user_id);
    return user?.display_name || null;
  }
  return assignment.manual_user_name || null;
}

export const assetTypes: AssetType[] = [
  { id: 1, code: 'LAPTOP', label: 'Laptop', category: 'EQUIPO' },
  { id: 2, code: 'DESKTOP', label: 'Torre / Desktop', category: 'EQUIPO' },
  { id: 3, code: 'TABLET', label: 'Tablet', category: 'EQUIPO' },
  { id: 4, code: 'MONITOR', label: 'Monitor', category: 'PERIFERICO' },
  { id: 5, code: 'HEADSET', label: 'Cascos / Headset', category: 'PERIFERICO' },
  { id: 6, code: 'WEBCAM', label: 'Webcam', category: 'PERIFERICO' },
  { id: 7, code: 'DOCK', label: 'Dock', category: 'PERIFERICO' },
  { id: 8, code: 'IMPRESORA', label: 'Impresora', category: 'PERIFERICO' },
  { id: 9, code: 'DISCO_EXTERNO', label: 'Disco externo', category: 'PERIFERICO' },
  { id: 10, code: 'ADAPTADOR', label: 'Adaptador', category: 'PERIFERICO' },
  { id: 11, code: 'ESCANER', label: 'Escáner', category: 'PERIFERICO' },
];

export const assetModels: AssetModel[] = [
  { id: 1, brand: 'Dell', model: 'XPS 15 9530', asset_type_id: 1, processor: 'Intel Core i7-13700H', ram_gb: 16, storage: '512GB SSD NVMe', screen_size: '15.6" OLED 3.5K', os: 'Windows 11 Pro', photo_url: null, notes: 'Gama alta para desarrollo' },
  { id: 2, brand: 'Lenovo', model: 'ThinkPad T14s Gen 4', asset_type_id: 1, processor: 'Intel Core i7-1365U', ram_gb: 16, storage: '512GB SSD', screen_size: '14" WUXGA', os: 'Windows 11 Pro', photo_url: null, notes: null },
  { id: 3, brand: 'HP', model: 'EliteBook 840 G10', asset_type_id: 1, processor: 'Intel Core i5-1345U', ram_gb: 16, storage: '256GB SSD', screen_size: '14" FHD', os: 'Windows 11 Pro', photo_url: null, notes: null },
  { id: 4, brand: 'Apple', model: 'MacBook Pro 14" M3', asset_type_id: 1, processor: 'Apple M3 Pro', ram_gb: 18, storage: '512GB SSD', screen_size: '14.2" Liquid Retina XDR', os: 'macOS Sonoma', photo_url: null, notes: 'Para equipos de diseño/desarrollo' },
  { id: 5, brand: 'Dell', model: 'Latitude 5540', asset_type_id: 1, processor: 'Intel Core i5-1345U', ram_gb: 8, storage: '256GB SSD', screen_size: '15.6" FHD', os: 'Windows 11 Pro', photo_url: null, notes: 'Gama estándar' },
  { id: 6, brand: 'ASUS', model: 'ZenBook 14 OLED', asset_type_id: 1, processor: 'Intel Core i7-1360P', ram_gb: 16, storage: '512GB SSD', screen_size: '14" 2.8K OLED', os: 'Windows 11', photo_url: null, notes: null },
  { id: 7, brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11', asset_type_id: 1, processor: 'Intel Core i7-1365U', ram_gb: 32, storage: '1TB SSD', screen_size: '14" 2.8K OLED', os: 'Windows 11 Pro', photo_url: null, notes: 'Premium ultraligero' },
  { id: 8, brand: 'HP', model: 'ProBook 450 G10', asset_type_id: 1, processor: 'Intel Core i5-1335U', ram_gb: 8, storage: '256GB SSD', screen_size: '15.6" FHD', os: 'Windows 11 Pro', photo_url: null, notes: 'Gama entrada' },
  { id: 9, brand: 'Dell', model: 'OptiPlex 7010', asset_type_id: 2, processor: 'Intel Core i7-13700', ram_gb: 16, storage: '512GB SSD', screen_size: null, os: 'Windows 11 Pro', photo_url: null, notes: 'Micro form factor' },
  { id: 10, brand: 'Samsung', model: 'Galaxy Tab S9', asset_type_id: 3, processor: 'Snapdragon 8 Gen 2', ram_gb: 8, storage: '128GB', screen_size: '11" AMOLED', os: 'Android 14', photo_url: null, notes: null },
  { id: 11, brand: 'Apple', model: 'iPad Air M1', asset_type_id: 3, processor: 'Apple M1', ram_gb: 8, storage: '256GB', screen_size: '10.9" Liquid Retina', os: 'iPadOS 17', photo_url: null, notes: null },
  { id: 12, brand: 'Dell', model: 'UltraSharp U2723QE', asset_type_id: 4, processor: null, ram_gb: null, storage: null, screen_size: '27" 4K IPS', os: null, photo_url: null, notes: 'USB-C Hub integrado' },
  { id: 13, brand: 'LG', model: '27UK850-W', asset_type_id: 4, processor: null, ram_gb: null, storage: null, screen_size: '27" 4K IPS', os: null, photo_url: null, notes: null },
  { id: 14, brand: 'Jabra', model: 'Evolve2 75', asset_type_id: 5, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: 'ANC, Bluetooth + USB dongle' },
  { id: 15, brand: 'Poly', model: 'Voyager Focus 2', asset_type_id: 5, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: 'ANC, Bluetooth' },
  { id: 16, brand: 'Logitech', model: 'C920 HD Pro', asset_type_id: 6, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: '1080p' },
  { id: 17, brand: 'Logitech', model: 'Brio 4K', asset_type_id: 6, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: '4K HDR' },
  { id: 18, brand: 'Dell', model: 'WD19S 180W', asset_type_id: 7, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: 'USB-C, 180W PD' },
  { id: 19, brand: 'Lenovo', model: 'ThinkPad USB-C Dock Gen 2', asset_type_id: 7, processor: null, ram_gb: null, storage: null, screen_size: null, os: null, photo_url: null, notes: null },
];

export const technicians: Technician[] = [
  { id: 1, name: 'Roberto Vega', email: 'rvega@techrepair.com', phone: '+34 612 345 678', specialty: 'Pantallas y displays', company: 'TechRepair Madrid S.L.', is_external: true, is_active: true },
  { id: 2, name: 'Antonio López', email: 'alopez@serviciosti.com', phone: '+34 654 321 987', specialty: 'Carcasas y componentes estructurales', company: 'ServiciosTI Sevilla', is_external: true, is_active: true },
  { id: 3, name: 'Laura Sánchez', email: 'laura@empresa.com', phone: null, specialty: 'Plataformado y configuración', company: null, is_external: false, is_active: true },
  { id: 4, name: 'Pedro Ruiz', email: 'pedro@empresa.com', phone: null, specialty: 'Hardware general', company: null, is_external: false, is_active: true },
];

export const hardwareParts: HardwarePart[] = [
  { id: 1, code: 'RAM-DDR5-16', name: 'Módulo RAM DDR5 16GB', category: 'Memoria', brand: 'Kingston', model: 'Fury Beast DDR5-5600', unit_cost: 45.00, stock: 10 },
  { id: 2, code: 'RAM-DDR4-8', name: 'Módulo RAM DDR4 8GB', category: 'Memoria', brand: 'Crucial', model: 'CT8G4SFRA32A', unit_cost: 22.00, stock: 15 },
  { id: 3, code: 'SSD-NVME-512', name: 'SSD NVMe 512GB', category: 'Almacenamiento', brand: 'Samsung', model: '980 Pro 512GB', unit_cost: 65.00, stock: 8 },
  { id: 4, code: 'SSD-NVME-1T', name: 'SSD NVMe 1TB', category: 'Almacenamiento', brand: 'Samsung', model: '980 Pro 1TB', unit_cost: 110.00, stock: 5 },
  { id: 5, code: 'BAT-DELL-XPS15', name: 'Batería Dell XPS 15', category: 'Batería', brand: 'Dell', model: '86Wh 6-cell', unit_cost: 89.00, stock: 3 },
  { id: 6, code: 'BAT-LENOVO-T14', name: 'Batería Lenovo T14s', category: 'Batería', brand: 'Lenovo', model: '57Wh internal', unit_cost: 75.00, stock: 4 },
  { id: 7, code: 'LCD-14FHD', name: 'Pantalla LCD 14" FHD', category: 'Pantalla', brand: 'BOE', model: 'NV140FHM-N4V', unit_cost: 120.00, stock: 2 },
  { id: 8, code: 'LCD-156OLED', name: 'Pantalla 15.6" OLED 3.5K', category: 'Pantalla', brand: 'Samsung', model: 'ATNA56YX03-0', unit_cost: 350.00, stock: 1 },
  { id: 9, code: 'KB-DELL-LAT', name: 'Teclado Dell Latitude', category: 'Teclado', brand: 'Dell', model: 'ES Layout backlit', unit_cost: 55.00, stock: 6 },
  { id: 10, code: 'KB-LENOVO-TP', name: 'Teclado Lenovo ThinkPad', category: 'Teclado', brand: 'Lenovo', model: 'ES Layout backlit', unit_cost: 60.00, stock: 4 },
  { id: 11, code: 'CHG-USBC-65W', name: 'Cargador USB-C 65W', category: 'Cargador', brand: 'Universal', model: 'GaN 65W PD', unit_cost: 35.00, stock: 12 },
  { id: 12, code: 'BISAGRA-14', name: 'Bisagra portátil 14"', category: 'Estructura', brand: 'Genérico', model: 'Hinge 14" universal', unit_cost: 25.00, stock: 6 },
];

export const repairParts: RepairPart[] = [
  { id: 1, repair_id: 1, part_id: 8, quantity: 1, action: 'REPLACED', notes: 'Pantalla OLED reemplazada por daño por presión' },
  { id: 2, repair_id: 2, part_id: 12, quantity: 2, action: 'REPLACED', notes: 'Ambas bisagras reemplazadas' },
];
