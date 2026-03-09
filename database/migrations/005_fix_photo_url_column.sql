-- Migration 005: Change photo_url to LONGTEXT for base64 image storage
USE it_inventory;

ALTER TABLE asset_models MODIFY COLUMN photo_url LONGTEXT NULL;
