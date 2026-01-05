
-- Füge nur die fehlende approval_chain Spalte hinzu, falls sie noch nicht existiert
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'approval_chain') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN approval_chain JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Füge auch andere möglicherweise fehlende Spalten hinzu
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'comments') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN comments JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'attachments') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'is_recurring') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'recurring_frequency') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN recurring_frequency TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'is_reimbursed') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN is_reimbursed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'expenses' 
                   AND column_name = 'reimbursement_date') THEN
        ALTER TABLE public.expenses 
        ADD COLUMN reimbursement_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
