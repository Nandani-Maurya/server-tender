-- Safe migration for tender.tender_categories audit/versioning columns + active-only uniqueness

ALTER TABLE tender.tender_categories
  ADD COLUMN IF NOT EXISTS created_by bigint REFERENCES tender.users(id);

ALTER TABLE tender.tender_categories
  ADD COLUMN IF NOT EXISTS updated_by bigint REFERENCES tender.users(id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tender_categories_name_key'
      AND conrelid = 'tender.tender_categories'::regclass
  ) THEN
    ALTER TABLE tender.tender_categories DROP CONSTRAINT tender_categories_name_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS tender_categories_active_name_uq
ON tender.tender_categories (lower(btrim(category_name)))
WHERE life_cycle_status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS tender_categories_active_description_uq
ON tender.tender_categories (lower(btrim(category_description)))
WHERE life_cycle_status = 'ACTIVE'
  AND category_description IS NOT NULL
  AND btrim(category_description) <> '';
