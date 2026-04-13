-- Remove type_code from project_types table
ALTER TABLE tender.project_types DROP COLUMN IF EXISTS type_code;
