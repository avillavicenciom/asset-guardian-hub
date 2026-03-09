-- Migration 004: Add SGAD column to assets table
-- Run this in your MySQL database

ALTER TABLE assets ADD COLUMN sgad VARCHAR(100) NULL AFTER serial_number;

-- Create index for SGAD lookups
CREATE INDEX idx_assets_sgad ON assets(sgad);
