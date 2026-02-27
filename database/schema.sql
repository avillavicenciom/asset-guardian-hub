-- =============================================
-- Asset Guardian - Script de creación de BD
-- Motor: MySQL 8+ (XAMPP)
-- =============================================

CREATE DATABASE IF NOT EXISTS it_inventory
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE it_inventory;

-- 1. Catálogo de estados
CREATE TABLE status_catalog (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(30)  NOT NULL UNIQUE,
  label       VARCHAR(60)  NOT NULL,
  is_terminal BOOLEAN      NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

INSERT INTO status_catalog (code, label, is_terminal) VALUES
  ('EN_ALMACEN',     'En almacén',      FALSE),
  ('POR_ASIGNAR',    'Por asignar',     FALSE),
  ('PLATAFORMANDO',  'Plataformando',   FALSE),
  ('ASIGNADO',       'Asignado',        FALSE),
  ('EN_REPARACION',  'En reparación',   FALSE),
  ('BAJA',           'Baja',            TRUE),
  ('EXTRAVIADO',     'Extraviado',      TRUE);

-- 2. Tipos de activo
CREATE TABLE asset_types (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  code     VARCHAR(30)  NOT NULL UNIQUE,
  label    VARCHAR(60)  NOT NULL,
  category ENUM('EQUIPO','PERIFERICO') NOT NULL
) ENGINE=InnoDB;

INSERT INTO asset_types (code, label, category) VALUES
  ('LAPTOP',     'Laptop',           'EQUIPO'),
  ('DESKTOP',    'Desktop',          'EQUIPO'),
  ('MONITOR',    'Monitor',          'PERIFERICO'),
  ('TECLADO',    'Teclado',          'PERIFERICO'),
  ('RATON',      'Ratón',            'PERIFERICO'),
  ('HEADSET',    'Headset',          'PERIFERICO'),
  ('DOCKING',    'Docking Station',  'PERIFERICO'),
  ('WEBCAM',     'Webcam',           'PERIFERICO'),
  ('TELEFONO',   'Teléfono IP',      'PERIFERICO');

-- 3. Modelos de equipo
CREATE TABLE asset_models (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  brand         VARCHAR(60)  NOT NULL,
  model         VARCHAR(100) NOT NULL,
  asset_type_id INT          NOT NULL,
  processor     VARCHAR(100) NULL,
  ram_gb        INT          NULL,
  storage       VARCHAR(60)  NULL,
  screen_size   VARCHAR(20)  NULL,
  os            VARCHAR(60)  NULL,
  photo_url     VARCHAR(500) NULL,
  notes         TEXT         NULL,
  FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
) ENGINE=InnoDB;

-- 4. Ubicaciones
CREATE TABLE locations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  country       VARCHAR(60)  NOT NULL,
  site          VARCHAR(60)  NOT NULL,
  center        VARCHAR(100) NOT NULL,
  location_type ENUM('ALMACEN','OFICINA','DATACENTER','OTRO') NOT NULL DEFAULT 'OFICINA',
  floor         VARCHAR(20)  NULL,
  notes         TEXT         NULL
) ENGINE=InnoDB;

-- 5. Operadores del sistema
CREATE TABLE operators (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  username    VARCHAR(60)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('ADMIN','TECH','READONLY') NOT NULL DEFAULT 'TECH',
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  permissions JSON         NULL COMMENT 'Array de permisos granulares',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Operador admin por defecto (password: admin123)
INSERT INTO operators (name, email, username, password, role, permissions) VALUES
  ('Administrador', 'admin@empresa.com', 'admin', SHA2('admin123', 256), 'ADMIN', '[]');

-- 6. Usuarios (empleados que reciben activos)
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  display_name  VARCHAR(150) NOT NULL,
  email         VARCHAR(200) NULL,
  username      VARCHAR(60)  NULL,
  department    VARCHAR(100) NULL,
  site          VARCHAR(60)  NULL,
  contract_end  DATE         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Activos
CREATE TABLE assets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  asset_tag     VARCHAR(50)  NULL UNIQUE COMMENT 'Código interno / ID Inventario',
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  category      ENUM('EQUIPO','PERIFERICO') NOT NULL DEFAULT 'EQUIPO',
  type          VARCHAR(50)  NULL,
  brand         VARCHAR(60)  NULL,
  model         VARCHAR(100) NULL,
  status_id     INT          NOT NULL,
  location_id   INT          NULL,
  notes         TEXT         NULL,
  tags          JSON         NULL COMMENT 'Array de etiquetas',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (status_id)   REFERENCES status_catalog(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB;

-- 8. Historial de cambios de estado
CREATE TABLE asset_status_history (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  asset_id               INT       NOT NULL,
  from_status_id         INT       NULL,
  to_status_id           INT       NOT NULL,
  changed_by_operator_id INT       NOT NULL,
  reason                 TEXT      NULL,
  changed_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id)               REFERENCES assets(id),
  FOREIGN KEY (from_status_id)         REFERENCES status_catalog(id),
  FOREIGN KEY (to_status_id)           REFERENCES status_catalog(id),
  FOREIGN KEY (changed_by_operator_id) REFERENCES operators(id)
) ENGINE=InnoDB;

-- 9. Asignaciones
CREATE TABLE assignments (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  asset_id                INT       NOT NULL,
  user_id                 INT       NULL,
  manual_user_name        VARCHAR(150) NULL,
  manual_user_email       VARCHAR(200) NULL,
  assigned_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  returned_at             TIMESTAMP NULL,
  assigned_by_operator_id INT       NOT NULL,
  delivery_mode           ENUM('SIGNED','TECH_VALIDATED') NOT NULL DEFAULT 'SIGNED',
  delivery_reason_code    VARCHAR(30) NULL,
  delivery_reason_text    TEXT      NULL,
  delivery_confirmed_at   TIMESTAMP NULL,
  delivery_pdf_path       VARCHAR(500) NULL,
  delivery_notified_at    TIMESTAMP NULL,
  FOREIGN KEY (asset_id)                REFERENCES assets(id),
  FOREIGN KEY (user_id)                 REFERENCES users(id),
  FOREIGN KEY (assigned_by_operator_id) REFERENCES operators(id)
) ENGINE=InnoDB;

-- 10. Evidencias de entrega
CREATE TABLE delivery_evidence (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id          INT          NOT NULL,
  type                   ENUM('PHOTO','EMAIL_CONFIRMATION','DOCUMENT','OTHER') NOT NULL,
  file_path              VARCHAR(500) NOT NULL,
  notes                  TEXT         NULL,
  created_by_operator_id INT          NOT NULL,
  created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id)          REFERENCES assignments(id),
  FOREIGN KEY (created_by_operator_id) REFERENCES operators(id)
) ENGINE=InnoDB;

-- 11. Técnicos de reparación
CREATE TABLE technicians (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) NOT NULL,
  phone       VARCHAR(30)  NULL,
  specialty   VARCHAR(100) NULL,
  company     VARCHAR(100) NULL,
  is_external BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 12. Piezas de hardware
CREATE TABLE hardware_parts (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  code      VARCHAR(30)  NOT NULL UNIQUE,
  name      VARCHAR(100) NOT NULL,
  category  VARCHAR(60)  NOT NULL,
  brand     VARCHAR(60)  NULL,
  model     VARCHAR(100) NULL,
  unit_cost DECIMAL(10,2) NULL,
  stock     INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- 13. Reparaciones
CREATE TABLE repairs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  asset_id         INT       NOT NULL,
  opened_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at        TIMESTAMP NULL,
  provider         VARCHAR(100) NULL,
  ticket_ref       VARCHAR(60)  NULL,
  diagnosis        TEXT      NULL,
  cost             DECIMAL(10,2) NULL,
  result_status_id INT       NULL,
  technician_id    INT       NULL,
  FOREIGN KEY (asset_id)         REFERENCES assets(id),
  FOREIGN KEY (result_status_id) REFERENCES status_catalog(id),
  FOREIGN KEY (technician_id)    REFERENCES technicians(id)
) ENGINE=InnoDB;

-- 14. Piezas usadas en reparaciones
CREATE TABLE repair_parts (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  repair_id INT NOT NULL,
  part_id   INT NOT NULL,
  quantity  INT NOT NULL DEFAULT 1,
  action    ENUM('REPLACED','ADDED','REMOVED') NOT NULL DEFAULT 'REPLACED',
  notes     TEXT NULL,
  FOREIGN KEY (repair_id) REFERENCES repairs(id),
  FOREIGN KEY (part_id)   REFERENCES hardware_parts(id)
) ENGINE=InnoDB;

-- 15. Log de auditoría
CREATE TABLE audit_log (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  timestamp     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operator_id   INT          NOT NULL,
  operator_name VARCHAR(120) NOT NULL,
  action        VARCHAR(60)  NOT NULL,
  module        VARCHAR(60)  NOT NULL,
  details       TEXT         NULL,
  FOREIGN KEY (operator_id) REFERENCES operators(id)
) ENGINE=InnoDB;

-- =============================================
-- Índices para rendimiento
-- =============================================
CREATE INDEX idx_assets_serial     ON assets(serial_number);
CREATE INDEX idx_assets_asset_tag  ON assets(asset_tag);
CREATE INDEX idx_assets_status     ON assets(status_id);
CREATE INDEX idx_assignments_asset ON assignments(asset_id);
CREATE INDEX idx_assignments_user  ON assignments(user_id);
CREATE INDEX idx_repairs_asset     ON repairs(asset_id);
CREATE INDEX idx_audit_operator    ON audit_log(operator_id);
CREATE INDEX idx_audit_timestamp   ON audit_log(timestamp);

SELECT '✅ Base de datos it_inventory creada correctamente' AS resultado;
