-- Update Tenders and Bids table to support Life Cycle Status
DO $$ 
BEGIN
    -- Add life_cycle_status to tenders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='tender' AND table_name='tenders' AND column_name='life_cycle_status') THEN
        ALTER TABLE tender.tenders ADD COLUMN life_cycle_status tender.life_cycle_status NOT NULL DEFAULT 'ACTIVE';
    END IF;

    -- Add life_cycle_status to bids
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='tender' AND table_name='bids' AND column_name='life_cycle_status') THEN
        ALTER TABLE tender.bids ADD COLUMN life_cycle_status tender.life_cycle_status NOT NULL DEFAULT 'ACTIVE';
    END IF;
END $$;
