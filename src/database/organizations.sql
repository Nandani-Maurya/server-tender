CREATE SCHEMA IF NOT EXISTS tender;


CREATE TABLE IF NOT EXISTS tender.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url text NOT NULL,
  label text,
  original_name text,
  mime_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


DROP TABLE IF EXISTS tender.bank_details CASCADE;
DROP TABLE IF EXISTS tender.iso_certificates CASCADE;
DROP TABLE IF EXISTS tender.organizations CASCADE;





CREATE TABLE IF NOT EXISTS tender.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name_of_firm text NOT NULL CHECK (char_length(name_of_firm) <= 200),
  registration_number text NOT NULL CHECK (char_length(registration_number) <= 100),
  registration_date date NOT NULL,
  email_address text NOT NULL CHECK (char_length(email_address) <= 150),
  web_address text NOT NULL CHECK (char_length(web_address) <= 300),
  year_of_establishment integer NOT NULL CHECK (year_of_establishment BETWEEN 1800 AND EXTRACT(YEAR FROM CURRENT_DATE)::int),
  type_of_firm text NOT NULL CHECK (char_length(type_of_firm) <= 100),
  pan_card_number text NOT NULL CHECK (char_length(pan_card_number) <= 10),
  gst_registration_number text NOT NULL CHECK (char_length(gst_registration_number) <= 15),
  epf_registration_number text NOT NULL CHECK (char_length(epf_registration_number) <= 22),
  esic_registration_number text NOT NULL CHECK (char_length(esic_registration_number) <= 17),
  head_office_state text NOT NULL CHECK (char_length(head_office_state) <= 100),
  head_office_city text NOT NULL CHECK (char_length(head_office_city) <= 100),
  head_office_full_address text NOT NULL CHECK (char_length(head_office_full_address) <= 500),
  head_office_pincode text NOT NULL CHECK (char_length(head_office_pincode) = 6),
  contacts jsonb DEFAULT '[]'::jsonb,
  branches jsonb DEFAULT '[]'::jsonb,
  partners jsonb DEFAULT '[]'::jsonb,
  life_cycle_status tender.life_cycle_status NOT NULL DEFAULT 'ACTIVE',
  created_by bigint REFERENCES tender.users(id),
  updated_by bigint REFERENCES tender.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_email_format_chk CHECK (email_address ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  CONSTRAINT organizations_pan_format_chk CHECK (pan_card_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  CONSTRAINT organizations_gst_format_chk CHECK (gst_registration_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$'),
  CONSTRAINT organizations_epf_format_chk CHECK (epf_registration_number ~ '^[A-Z]{2}[A-Z0-9]{10,22}$'),
  CONSTRAINT organizations_esic_format_chk CHECK (esic_registration_number ~ '^[0-9]{17}$'),
  CONSTRAINT organizations_contacts_nonempty_chk CHECK (jsonb_array_length(contacts) >= 1),
  CONSTRAINT organizations_branches_nonempty_chk CHECK (jsonb_array_length(branches) >= 1)
);


CREATE TABLE IF NOT EXISTS tender.iso_certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_type text,
  year text,
  first_image_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  second_image_id uuid REFERENCES tender.documents(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS tender.bank_details (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
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
