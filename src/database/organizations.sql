CREATE SCHEMA IF NOT EXISTS tender;

-- Documents Table
CREATE TABLE IF NOT EXISTS tender.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url text NOT NULL,
  label text,       -- e.g., 'ISO_CERT_1', 'BANK_STATEMENT'
  original_name text,
  mime_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Drop tables if needed to recreate them (for local dev testing)
DROP TABLE IF EXISTS tender.bank_details CASCADE;
DROP TABLE IF EXISTS tender.iso_certificates CASCADE;
DROP TABLE IF EXISTS tender.organizations CASCADE;

-- Documents Table remains untouched, or can be dropped if we want total wipe
-- CREATE TABLE IF NOT EXISTS tender.documents ...

-- Organizations Table
CREATE TABLE IF NOT EXISTS tender.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name_of_firm text,
  registration_number text,
  registration_date date,
  email_address text,
  web_address text,
  year_of_establishment integer,
  type_of_firm text,
  pan_card_number text,
  gst_registration_number text,
  epf_registration_number text,
  esic_registration_number text,
  head_office_state text,
  head_office_city text,
  head_office_full_address text,
  contacts jsonb DEFAULT '[]'::jsonb,
  branches jsonb DEFAULT '[]'::jsonb,
  partners jsonb DEFAULT '[]'::jsonb,
  life_cycle_status tender.life_cycle_status NOT NULL DEFAULT 'ACTIVE',
  created_by bigint REFERENCES tender.users(id),
  updated_by bigint REFERENCES tender.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ISO Certificates Table
CREATE TABLE IF NOT EXISTS tender.iso_certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES tender.organizations(id) ON DELETE CASCADE,
  certificate_type text,
  year text, 
  first_image_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  second_image_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Bank Details Table
CREATE TABLE IF NOT EXISTS tender.bank_details (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES tender.organizations(id) ON DELETE CASCADE,
  bank_name text,
  branch_name text,
  account_holder_name text,
  account_number text,
  ifsc_code text,
  micr_code text,
  account_type text,
  upi_id text,
  bank_statement_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  passbook_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
