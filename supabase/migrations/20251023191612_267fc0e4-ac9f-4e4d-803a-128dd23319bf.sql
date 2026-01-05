-- Erweitere channels Tabelle für vollständige Chat-Funktionalität
ALTER TABLE public.channels
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS retention_policy_days INTEGER DEFAULT 365,
ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_message TEXT,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();