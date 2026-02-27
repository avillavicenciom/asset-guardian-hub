# 🗄️ Asset Guardian - Instalación de Base de Datos

## Paso a paso (para tontos 😄)

### Paso 1: Instalar XAMPP
1. Descarga XAMPP de https://www.apachefriends.org/es/download.html
2. Instálalo en `C:\xampp` (ruta por defecto)
3. Durante la instalación, asegúrate de marcar **MySQL**

### Paso 2: Iniciar MySQL
1. Abre **XAMPP Control Panel** (busca "XAMPP" en el menú inicio)
2. Haz clic en **Start** junto a **MySQL**
3. Espera a que el texto "MySQL" se ponga en **verde**

### Paso 3: Crear la base de datos

#### Opción A: Automático (doble clic)
1. Ve a la carpeta `database/` de este proyecto
2. Haz **doble clic** en `setup-database.bat`
3. ¡Listo! Verás el mensaje "Base de datos creada exitosamente"

#### Opción B: Manual (phpMyAdmin)
1. Con MySQL corriendo, abre tu navegador en: http://localhost/phpmyadmin
2. Haz clic en la pestaña **SQL** (arriba)
3. Copia TODO el contenido del archivo `schema.sql`
4. Pégalo en el cuadro de texto
5. Haz clic en **Continuar / Go**
6. Verás: ✅ Base de datos it_inventory creada correctamente

#### Opción C: Manual (terminal)
```bash
cd database
C:\xampp\mysql\bin\mysql.exe -u root < schema.sql
```

### Paso 4: Verificar
1. Abre http://localhost/phpmyadmin
2. En el panel izquierdo debe aparecer **it_inventory**
3. Haz clic en ella → verás 15 tablas

### Credenciales por defecto
| Campo    | Valor          |
|----------|----------------|
| Usuario  | `admin`        |
| Password | `admin123`     |
| Rol      | Administrador  |

### Estructura de tablas
| #  | Tabla                 | Descripción                    |
|----|----------------------|--------------------------------|
| 1  | status_catalog       | Catálogo de estados            |
| 2  | asset_types          | Tipos de activo                |
| 3  | asset_models         | Modelos con especificaciones   |
| 4  | locations            | Ubicaciones jerárquicas        |
| 5  | operators            | Operadores del sistema         |
| 6  | users                | Usuarios/empleados             |
| 7  | assets               | Activos de TI                  |
| 8  | asset_status_history | Historial de cambios de estado |
| 9  | assignments          | Asignaciones activo↔usuario    |
| 10 | delivery_evidence    | Evidencias de entrega          |
| 11 | technicians          | Técnicos de reparación         |
| 12 | hardware_parts       | Piezas de hardware             |
| 13 | repairs              | Reparaciones                   |
| 14 | repair_parts         | Piezas usadas en reparaciones  |
| 15 | audit_log            | Log de auditoría               |

### ¿Problemas?
- **"No se encontró MySQL"**: Verifica que XAMPP está en `C:\xampp`. Si está en otra ruta, edita `setup-database.bat` y cambia `SET XAMPP_PATH=`
- **"Access denied"**: Por defecto XAMPP no tiene contraseña en root. Si le pusiste una, usa: `mysql -u root -p < schema.sql`
- **MySQL no arranca**: Verifica que el puerto 3306 no esté ocupado (otro MySQL o MariaDB corriendo)
