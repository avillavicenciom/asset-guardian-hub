-- =============================================
-- Migration 003: Departamentos + Estados de reparación + Campos extra en repairs
-- =============================================

USE it_inventory;

-- 1. Tabla de departamentos
CREATE TABLE IF NOT EXISTS departments (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 2. Tabla de estados de reparación
CREATE TABLE IF NOT EXISTS repair_statuses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(30)  NOT NULL UNIQUE,
  label      VARCHAR(60)  NOT NULL,
  color      VARCHAR(20)  NOT NULL DEFAULT '#6b7280',
  sort_order INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Insertar estados predefinidos
INSERT INTO repair_statuses (code, label, color, sort_order) VALUES
  ('PENDIENTE',       'Pendiente',              '#eab308', 1),
  ('EN_DIAGNOSTICO',  'En diagnóstico',         '#3b82f6', 2),
  ('EN_REPARACION',   'En reparación',          '#f97316', 3),
  ('EN_PROVEEDOR',    'En proveedor',           '#8b5cf6', 4),
  ('REPARADO',        'Reparado',               '#22c55e', 5),
  ('IRREPARABLE',     'Irreparable',            '#ef4444', 6),
  ('BAJA_INVENTARIO', 'Baja del inventario',    '#1f2937', 7);

-- 3. Nuevas columnas en la tabla repairs
ALTER TABLE repairs
  ADD COLUMN action_performed TEXT NULL AFTER diagnosis,
  ADD COLUMN incident_type ENUM('HARDWARE','SOFTWARE','ACCESORIO','PREVENTIVO','OTRO') NULL AFTER action_performed,
  ADD COLUMN is_warranty BOOLEAN NOT NULL DEFAULT FALSE AFTER incident_type,
  ADD COLUMN repair_status_id INT NULL AFTER is_warranty,
  ADD CONSTRAINT fk_repair_status FOREIGN KEY (repair_status_id) REFERENCES repair_statuses(id);

SELECT '✅ Migración 003 ejecutada correctamente' AS resultado;
