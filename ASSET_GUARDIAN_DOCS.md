# 🛡️ Asset Guardian - Documentación Completa del Proyecto

> Sistema de inventario de TI para la gestión centralizada de activos, operadores, usuarios, asignaciones, reparaciones y auditoría.

---

## 📋 Índice

1. [Arquitectura General](#-arquitectura-general)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Estructura de Carpetas](#-estructura-de-carpetas)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación Paso a Paso](#-instalación-paso-a-paso)
6. [Configuración de Base de Datos](#-configuración-de-base-de-datos)
7. [Configuración del Backend](#-configuración-del-backend)
8. [Configuración del Frontend](#-configuración-del-frontend)
9. [Conexión Frontend ↔ Backend ↔ MySQL](#-conexión-frontend--backend--mysql)
10. [Esquema de Base de Datos](#-esquema-de-base-de-datos)
11. [Migraciones Pendientes](#-migraciones-pendientes)
12. [Endpoints de la API](#-endpoints-de-la-api)
13. [Autenticación](#-autenticación)
14. [Sistema de Permisos](#-sistema-de-permisos)
15. [Credenciales por Defecto](#-credenciales-por-defecto)
16. [Variables de Entorno](#-variables-de-entorno)
17. [Migración a Otra Cuenta de Lovable](#-migración-a-otra-cuenta-de-lovable)
18. [Solución de Problemas](#-solución-de-problemas)

---

## 🏗️ Arquitectura General

```
┌──────────────────────┐     HTTP (JSON)     ┌──────────────────────┐     SQL (mysql2)     ┌──────────────────────┐
│                      │ ──────────────────▶  │                      │ ──────────────────▶  │                      │
│   Frontend (React)   │                      │   Backend (Express)  │                      │   MySQL (XAMPP)       │
│   Puerto: 8080       │ ◀──────────────────  │   Puerto: 3001       │ ◀──────────────────  │   Puerto: 3306       │
│   (Lovable/Vite)     │                      │   /backend/server.js │                      │   BD: it_inventory   │
└──────────────────────┘                      └──────────────────────┘                      └──────────────────────┘
```

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui (se ejecuta en Lovable o localmente)
- **Backend**: Express.js (Node.js) — servidor local en `/backend/`
- **Base de datos**: MySQL 8+ vía XAMPP — esquema en `/database/schema.sql`

> ⚠️ El frontend en Lovable se conecta al backend local. Para que funcione en producción, el backend debe estar accesible desde la URL del frontend.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.x | Framework UI |
| Vite | 7.3.x | Bundler / Dev server |
| TypeScript | 5.8.x | Tipado estático |
| Tailwind CSS | 3.4.x | Estilos utilitarios |
| shadcn/ui | - | Componentes UI (Radix) |
| React Router DOM | 6.30.x | Enrutamiento SPA |
| React Hook Form | 7.61.x | Formularios |
| Zod | 3.25.x | Validación de esquemas |
| Recharts | 2.15.x | Gráficas del dashboard |
| Framer Motion | 12.34.x | Animaciones |
| Tanstack React Query | 5.83.x | Cache de datos |
| Lucide React | 0.462.x | Iconos |
| Sonner | 1.7.x | Notificaciones toast |
| date-fns | 3.6.x | Manejo de fechas |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | LTS (>=18) | Runtime |
| Express | 4.21.x | Servidor HTTP |
| mysql2 | 3.11.x | Driver MySQL (promises) |
| cors | 2.8.x | Habilitación CORS |

### Base de Datos
| Tecnología | Versión | Uso |
|---|---|---|
| MySQL | 8+ | Motor de BD |
| XAMPP | Última | Entorno MySQL local |

---

## 📁 Estructura de Carpetas

```
asset-guardian-hub/
├── backend/                    # Servidor Express.js
│   ├── server.js               # Archivo principal del servidor (todas las rutas)
│   ├── db.js                   # Pool de conexión MySQL (mysql2/promise)
│   ├── package.json            # Dependencias del backend
│   ├── .env.example            # Variables de entorno de ejemplo
│   └── README.md               # Instrucciones del backend
│
├── database/                   # Scripts SQL
│   ├── schema.sql              # Esquema completo (CREATE DATABASE + 15 tablas + datos iniciales)
│   ├── setup-database.bat      # Script automático para Windows/XAMPP
│   ├── README.md               # Instrucciones de la BD
│   └── migrations/             # Migraciones incrementales
│       ├── 003_departments_repair_statuses.sql
│       ├── 004_add_sgad_column.sql
│       └── 005_fix_photo_url_column.sql
│
├── src/                        # Código fuente del frontend
│   ├── main.tsx                # Punto de entrada React
│   ├── App.tsx                 # Router principal
│   ├── index.css               # Estilos globales + tokens de diseño
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP (fetch) — conecta con backend:3001
│   │   └── utils.ts            # Utilidades (cn, etc.)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación + auditoría
│   ├── hooks/
│   │   ├── useData.ts          # Hook principal: carga todos los datos de la API
│   │   ├── useRole.ts          # Hook de verificación de roles/permisos
│   │   ├── useTheme.ts         # Tema claro/oscuro
│   │   └── useDashboardLayout.ts
│   ├── data/
│   │   └── types.ts            # Interfaces TypeScript de todas las entidades
│   ├── components/             # Componentes reutilizables
│   │   ├── AppLayout.tsx       # Layout principal con sidebar
│   │   ├── CreateAssetDialog.tsx
│   │   ├── AssignAssetDialog.tsx
│   │   ├── ReturnAssetDialog.tsx
│   │   ├── CreateRepairDialog.tsx
│   │   ├── CloseRepairDialog.tsx
│   │   ├── CreateUserDialog.tsx
│   │   ├── EditUserDialog.tsx
│   │   ├── ImportAssetsDialog.tsx
│   │   ├── ImportUsersDialog.tsx
│   │   ├── NavLink.tsx
│   │   └── ui/                 # Componentes shadcn/ui (no modificar)
│   ├── pages/                  # Páginas/vistas
│   │   ├── Index.tsx           # Redirect a login o dashboard
│   │   ├── LoginPage.tsx       # Pantalla de inicio de sesión
│   │   ├── Dashboard.tsx       # Panel principal con estadísticas
│   │   ├── Assets.tsx          # Tabla de activos (con columnas configurables)
│   │   ├── AssetDetailPage.tsx # Detalle individual de un activo
│   │   ├── AssignmentsPage.tsx # Gestión de asignaciones
│   │   ├── RepairsPage.tsx     # Gestión de reparaciones
│   │   ├── UsersPage.tsx       # Gestión de usuarios/empleados
│   │   ├── AuditPage.tsx       # Log de auditoría
│   │   ├── SettingsPage.tsx    # Página de ajustes (tabs)
│   │   ├── HelpPage.tsx        # Página de ayuda
│   │   ├── SetupGuidePage.tsx  # Manual de instalación interactivo
│   │   └── settings/           # Tabs de configuración
│   │       ├── StatusesTab.tsx
│   │       ├── AssetTypesTab.tsx
│   │       ├── ModelsTab.tsx
│   │       ├── LocationsTab.tsx
│   │       ├── OperatorsTab.tsx
│   │       ├── TechniciansTab.tsx
│   │       ├── HardwarePartsTab.tsx
│   │       ├── DepartmentsTab.tsx
│   │       └── RepairStatusesTab.tsx
│   ├── utils/
│   │   ├── generateReceipt.ts       # Generación de recibo de entrega (PDF)
│   │   └── generateReturnReceipt.ts # Generación de recibo de devolución
│   └── assets/
│       ├── logo.png            # Logo claro
│       └── logo-dark.png       # Logo oscuro
│
├── public/                     # Archivos estáticos
├── index.html                  # HTML base
├── vite.config.ts              # Configuración de Vite
├── tailwind.config.ts          # Configuración de Tailwind
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencias del frontend
```

---

## ✅ Requisitos Previos

| Software | Versión | Descarga |
|---|---|---|
| **XAMPP** | Última | https://www.apachefriends.org/es/download.html |
| **Node.js** | LTS (>=18) | https://nodejs.org |
| **Git** | Última | https://git-scm.com |

---

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/avillavicenciom/asset-guardian-hub.git
cd asset-guardian-hub
```

### Paso 2: Instalar XAMPP e iniciar MySQL
1. Instalar XAMPP en `C:\xampp` (ruta por defecto)
2. Abrir **XAMPP Control Panel**
3. Hacer clic en **Start** junto a **MySQL**
4. Esperar a que MySQL se ponga en **verde**

### Paso 3: Crear la base de datos

**Opción A — Automático (Windows):**
```bash
cd database
setup-database.bat
```

**Opción B — Manual (terminal):**
```bash
C:\xampp\mysql\bin\mysql.exe -u root < database/schema.sql
```

**Opción C — phpMyAdmin:**
1. Abrir http://localhost/phpmyadmin
2. Pestaña **SQL** → pegar contenido de `database/schema.sql` → **Ejecutar**

### Paso 4: Ejecutar migraciones (en orden)
```bash
C:\xampp\mysql\bin\mysql.exe -u root < database/migrations/003_departments_repair_statuses.sql
C:\xampp\mysql\bin\mysql.exe -u root < database/migrations/004_add_sgad_column.sql
C:\xampp\mysql\bin\mysql.exe -u root < database/migrations/005_fix_photo_url_column.sql
```

### Paso 5: Instalar y arrancar el backend
```bash
cd backend
npm install
npm run dev
```
Verás: `🚀 Asset Guardian API corriendo en http://localhost:3001`

### Paso 6: Verificar conexión
Abrir en el navegador: **http://localhost:3001/api/health**
```json
{ "status": "ok", "database": "connected" }
```

### Paso 7: Instalar y arrancar el frontend (si es local)
```bash
# Volver a la raíz del proyecto
cd ..
npm install
npm run dev
```
Frontend disponible en: **http://localhost:8080**

> **Nota**: Si usas Lovable, el frontend ya corre en la nube. Solo necesitas el backend local corriendo en el puerto 3001.

---

## 🗄️ Configuración de Base de Datos

### Datos de conexión (por defecto XAMPP)

| Parámetro | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `3306` |
| Usuario | `root` |
| Contraseña | *(vacía)* |
| Base de datos | `it_inventory` |
| Motor | InnoDB |
| Charset | utf8mb4_unicode_ci |

### Archivo de conexión: `backend/db.js`
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'it_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

## 🔧 Configuración del Backend

### Archivo principal: `backend/server.js`

- **Puerto**: 3001 (configurable con `API_PORT`)
- **CORS**: Habilitado para todas las solicitudes
- **Body parser**: JSON con límite de 50MB (para fotos base64 de modelos)
- **Autenticación**: SHA-256 (sin bcrypt, sin JWT — sesión en localStorage del frontend)

### Variables de entorno: `backend/.env` (opcional)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=it_inventory
API_PORT=3001
```
> Si XAMPP usa la configuración por defecto, **no necesitas crear este archivo**.

---

## ⚛️ Configuración del Frontend

### Conexión con la API: `src/lib/api.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

- Por defecto conecta a `http://localhost:3001/api`
- Para cambiar la URL, crear archivo `.env` en la raíz:
  ```env
  VITE_API_URL=http://tu-servidor:3001/api
  ```

### Vite config: `vite.config.ts`
- Puerto del dev server: **8080**
- Alias `@` → `./src`
- Plugin: `@vitejs/plugin-react-swc`

---

## 🔗 Conexión Frontend ↔ Backend ↔ MySQL

### Flujo completo de una petición:

```
1. Usuario interactúa con la UI (React)
      ↓
2. Componente llama a useData() o api.xxx()
      ↓
3. src/lib/api.ts hace fetch() a http://localhost:3001/api/...
      ↓
4. backend/server.js recibe la petición Express
      ↓
5. server.js usa pool (backend/db.js) para ejecutar SQL
      ↓
6. MySQL (XAMPP) procesa la query y devuelve resultados
      ↓
7. server.js devuelve JSON al frontend
      ↓
8. React actualiza el estado y re-renderiza
```

### Archivos clave de la conexión:

| Archivo | Función |
|---|---|
| `src/lib/api.ts` | Cliente HTTP del frontend (fetch wrapper + auditoría automática) |
| `src/hooks/useData.ts` | Hook que carga todos los catálogos al iniciar (statuses, users, assets, etc.) |
| `src/contexts/AuthContext.tsx` | Maneja login/logout, guarda sesión en localStorage, registra auditoría |
| `backend/server.js` | Servidor Express con todas las rutas REST |
| `backend/db.js` | Pool de conexión MySQL2 (promises) |

---

## 🗃️ Esquema de Base de Datos

### 17 Tablas (15 base + 2 migraciones)

| # | Tabla | Descripción | Migración |
|---|---|---|---|
| 1 | `status_catalog` | Catálogo de estados de activos (EN_ALMACEN, ASIGNADO, etc.) | Base |
| 2 | `asset_types` | Tipos de activo (LAPTOP, DESKTOP, MONITOR, etc.) | Base |
| 3 | `asset_models` | Modelos con specs (procesador, RAM, almacenamiento, foto) | Base + Mig.005 |
| 4 | `locations` | Ubicaciones jerárquicas (país → sitio → centro) | Base |
| 5 | `operators` | Operadores del sistema (login, roles, permisos JSON) | Base |
| 6 | `users` | Usuarios finales / empleados que reciben activos | Base |
| 7 | `assets` | Activos de TI (serial, asset_tag, sgad, status, location, tags) | Base + Mig.004 |
| 8 | `asset_status_history` | Historial de cambios de estado por activo | Base |
| 9 | `assignments` | Asignaciones activo ↔ usuario | Base |
| 10 | `delivery_evidence` | Evidencias de entrega (fotos, documentos) | Base |
| 11 | `technicians` | Técnicos de reparación | Base |
| 12 | `hardware_parts` | Catálogo de piezas de hardware | Base |
| 13 | `repairs` | Reparaciones (con tipo incidente, garantía, status) | Base + Mig.003 |
| 14 | `repair_parts` | Piezas usadas en cada reparación | Base |
| 15 | `audit_log` | Registro de auditoría (quién hizo qué y cuándo) | Base |
| 16 | `departments` | Catálogo de departamentos | Mig.003 |
| 17 | `repair_statuses` | Estados específicos de reparación (con colores) | Mig.003 |

### Relaciones principales:
```
assets.status_id       → status_catalog.id
assets.location_id     → locations.id
assignments.asset_id   → assets.id
assignments.user_id    → users.id
repairs.asset_id       → assets.id
repairs.technician_id  → technicians.id
repairs.repair_status_id → repair_statuses.id
audit_log.operator_id  → operators.id
```

---

## 📦 Migraciones Pendientes

Después de ejecutar `schema.sql`, ejecutar **en orden**:

### Migración 003: Departamentos + Estados de reparación
```sql
-- Crea tablas: departments, repair_statuses
-- Agrega columnas a repairs: action_performed, incident_type, is_warranty, repair_status_id
```

### Migración 004: Campo SGAD en activos
```sql
-- Agrega columna: assets.sgad VARCHAR(100)
-- Crea índice: idx_assets_sgad
```

### Migración 005: Foto de modelos en base64
```sql
-- Cambia: asset_models.photo_url de VARCHAR(500) a LONGTEXT
```

---

## 📡 Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión (username + password) |
| POST | `/api/auth/register` | Registrar nuevo operador (rol READONLY) |

### CRUD Genéricos (GET, GET/:id, POST, PUT/:id, DELETE/:id)
| Ruta base | Tabla MySQL |
|---|---|
| `/api/statuses` | status_catalog |
| `/api/asset-types` | asset_types |
| `/api/asset-models` | asset_models |
| `/api/locations` | locations |
| `/api/operators` | operators (JSON: permissions) |
| `/api/users` | users |
| `/api/assets` | assets (JSON: tags) |
| `/api/assignments` | assignments |
| `/api/repairs` | repairs |
| `/api/technicians` | technicians |
| `/api/hardware-parts` | hardware_parts |
| `/api/repair-parts` | repair_parts |
| `/api/audit-log` | audit_log |
| `/api/status-history` | asset_status_history |
| `/api/delivery-evidence` | delivery_evidence |
| `/api/departments` | departments |
| `/api/repair-statuses` | repair_statuses |

### Endpoints Específicos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Health check (verifica conexión a BD) |
| GET | `/api/dashboard/stats` | Estadísticas del dashboard |
| GET | `/api/assets/:id/assignments` | Asignaciones de un activo específico |
| GET | `/api/assets/:id/status-history` | Historial de estados de un activo |
| GET | `/api/assets/:id/repairs` | Reparaciones de un activo |

---

## 🔐 Autenticación

### Flujo:
1. Usuario envía `username` + `password` a `POST /api/auth/login`
2. Backend hashea password con **SHA-256** y busca en tabla `operators`
3. Si coincide y `is_active = 1`, devuelve datos del operador (sin token)
4. Frontend guarda operador en `localStorage` (key: `it_inventory_auth`)
5. Al recargar, `AuthContext.tsx` lee de localStorage para restaurar sesión

### ⚠️ Notas de seguridad:
- No se usa JWT ni tokens de sesión
- No se usa bcrypt (se usa SHA-256 directo)
- La sesión vive en localStorage del navegador
- Diseñado para uso en red interna/local

---

## 🔑 Sistema de Permisos

### Roles de operador:
| Rol | Descripción |
|---|---|
| `ADMIN` | Acceso completo a todo el sistema |
| `TECH` | Operador técnico con permisos configurables |
| `READONLY` | Solo lectura (rol por defecto al registrarse) |

### Permisos granulares (almacenados en JSON):
```
assets.create, assets.edit, assets.delete, assets.assign
users.create, users.edit, users.delete, users.import
repairs.create, repairs.edit, repairs.close
settings.view, settings.edit
audit.view
reports.view, reports.export
```

Los permisos se guardan como array JSON en `operators.permissions`.
El rol ADMIN tiene todos los permisos automáticamente.

---

## 👤 Credenciales por Defecto

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | ADMIN |
| Email | admin@empresa.com |

---

## 🌍 Variables de Entorno

### Frontend (raíz del proyecto)
| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base de la API REST |

### Backend (`backend/.env`)
| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DB_HOST` | `localhost` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_USER` | `root` | Usuario de MySQL |
| `DB_PASSWORD` | *(vacía)* | Contraseña de MySQL |
| `DB_NAME` | `it_inventory` | Nombre de la base de datos |
| `API_PORT` | `3001` | Puerto del servidor Express |

---

## 🔄 Migración a Otra Cuenta de Lovable

### Paso 1: Transferir proyecto
1. En Lovable actual → clic en nombre del proyecto (arriba izquierda)
2. **Settings** → **Transfer project**
3. Escribir el **email de la cuenta destino**
4. Confirmar transferencia

### Paso 2: Aceptar en la cuenta destino
1. Iniciar sesión en la nueva cuenta de Lovable
2. Aceptar la transferencia del proyecto
3. Si necesitas privacidad, marcar el proyecto como privado

### Paso 3: Reconectar GitHub
1. En la nueva cuenta → **Settings** → **GitHub**
2. Conectar con la cuenta de GitHub que tiene el repo `asset-guardian-hub`
3. Vincular el repositorio existente

### Paso 4: El backend y la BD no cambian
- MySQL (XAMPP) y el servidor Express son **100% locales**
- No dependen de la cuenta de Lovable
- Solo asegúrate de que `VITE_API_URL` apunte a tu backend local

---

## ❓ Solución de Problemas

| Problema | Solución |
|---|---|
| `ECONNREFUSED 3306` | MySQL no está corriendo → Iniciar MySQL en XAMPP |
| `ER_BAD_DB_ERROR` | BD no creada → Ejecutar `database/setup-database.bat` |
| `CORS error` en el frontend | Verificar que el backend Express esté corriendo en puerto 3001 |
| `npm not found` | Instalar Node.js LTS desde https://nodejs.org |
| Login no funciona | Verificar que se ejecutaron todas las migraciones |
| Columnas no aparecen en la tabla | Limpiar localStorage del navegador (o cambiar CONFIG_VERSION) |
| Fotos de modelos no se guardan | Ejecutar migración 005 (LONGTEXT) |
| PowerShell bloquea npm | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Frontend no conecta al backend | Verificar que no hay firewall bloqueando puerto 3001 |
| `fetch failed` en Lovable preview | El backend debe ser accesible desde internet (ngrok, etc.) |

---

## 📝 Notas Adicionales

- El proyecto incluye una **guía de instalación interactiva** en la ruta `/setup-guide` (accesible desde Ayuda)
- Los recibos de entrega/devolución se generan como PDF desde el frontend (`src/utils/generateReceipt.ts`)
- El sistema soporta **importación masiva** de activos y usuarios por CSV
- El dashboard muestra estadísticas en tiempo real desde la BD
- Tema claro/oscuro disponible con logos adaptados

---

*Documento generado el 10/03/2026 — Asset Guardian v1.0*
