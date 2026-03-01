# 🚀 Asset Guardian - Backend API

## Paso a paso (para tontos 😄)

### Requisitos previos
1. ✅ XAMPP instalado y MySQL corriendo (ver `database/README.md`)
2. ✅ Base de datos `it_inventory` creada (ejecutar `database/setup-database.bat`)
3. ✅ Node.js instalado (descargar de https://nodejs.org → versión LTS)

### Paso 1: Abrir terminal en la carpeta backend
```bash
cd backend
```

### Paso 2: Instalar dependencias
```bash
npm install
```
Esto instalará: express, mysql2, cors

### Paso 3: Configurar conexión (opcional)
Si tu XAMPP usa la configuración por defecto, **no necesitas cambiar nada**.

Si cambiaste algo (contraseña, puerto), copia el archivo de ejemplo:
```bash
copy .env.example .env
```
Y edita `.env` con tus valores.

### Paso 4: Iniciar el servidor
```bash
npm run dev
```

Verás:
```
🚀 Asset Guardian API corriendo en http://localhost:3001
📋 Health check: http://localhost:3001/api/health
```

### Paso 5: Verificar
Abre en tu navegador: **http://localhost:3001/api/health**

Deberías ver:
```json
{ "status": "ok", "database": "connected" }
```

---

## 📋 Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar operador |
| GET | `/api/assets` | Listar activos |
| POST | `/api/assets` | Crear activo |
| GET | `/api/assets/:id` | Detalle de activo |
| PUT | `/api/assets/:id` | Actualizar activo |
| DELETE | `/api/assets/:id` | Eliminar activo |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/assignments` | Listar asignaciones |
| GET | `/api/repairs` | Listar reparaciones |
| GET | `/api/statuses` | Catálogo de estados |
| GET | `/api/locations` | Ubicaciones |
| GET | `/api/operators` | Operadores |
| GET | `/api/technicians` | Técnicos |
| GET | `/api/hardware-parts` | Piezas de hardware |
| GET | `/api/audit-log` | Log de auditoría |
| GET | `/api/dashboard/stats` | Estadísticas del dashboard |
| GET | `/api/assets/:id/assignments` | Asignaciones de un activo |
| GET | `/api/assets/:id/status-history` | Historial de estados |
| GET | `/api/assets/:id/repairs` | Reparaciones de un activo |

---

## 🏗️ Arquitectura

```
[React App :5173]  ──HTTP──▶  [Express API :3001]  ──SQL──▶  [MySQL XAMPP :3306]
     Frontend                    Este servidor                 Base de datos
```

## ❓ Problemas comunes

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED 3306` | MySQL no está corriendo → Inicia MySQL en XAMPP |
| `ER_BAD_DB_ERROR` | No has creado la BD → Ejecuta `database/setup-database.bat` |
| `npm not found` | Instala Node.js desde https://nodejs.org |
| `CORS error` | El servidor ya incluye CORS, verifica que esté corriendo |
