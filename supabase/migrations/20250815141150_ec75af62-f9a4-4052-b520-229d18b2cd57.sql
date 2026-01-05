-- Erweitere die documents Tabelle für Genehmigungsprozesse und digitale Signaturen
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_comments text,
ADD COLUMN IF NOT EXISTS requires_signature boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS signature_status text DEFAULT 'unsigned',
ADD COLUMN IF NOT EXISTS digital_signature jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS signed_by uuid,
ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone;

-- Erstelle Tabelle für Dokumenten-Genehmigungsworkflows
CREATE TABLE IF NOT EXISTS document_approvals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  rejection_reason text
);

-- Erstelle Tabelle für digitale Signaturen
CREATE TABLE IF NOT EXISTS document_signatures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  signer_id uuid NOT NULL,
  signature_data jsonb NOT NULL DEFAULT '{}',
  signature_type text NOT NULL DEFAULT 'digital' CHECK (signature_type IN ('digital', 'electronic', 'biometric')),
  signature_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  certificate_data jsonb DEFAULT '{}',
  is_valid boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Erstelle Tabelle für Genehmigungsregeln
CREATE TABLE IF NOT EXISTS document_approval_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_category document_category NOT NULL,
  company_id uuid,
  required_roles text[] DEFAULT '{}',
  minimum_approvers integer DEFAULT 1,
  auto_approve_conditions jsonb DEFAULT '{}',
  escalation_rules jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Aktiviere RLS für alle neuen Tabellen
ALTER TABLE document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_approval_rules ENABLE ROW LEVEL SECURITY;

-- RLS-Policies für document_approvals
CREATE POLICY "Users can view approvals for their documents" 
ON document_approvals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_approvals.document_id 
    AND d.created_by = auth.uid()
  )
  OR approver_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin', 'hr')
  )
);

CREATE POLICY "Approvers can update their approvals" 
ON document_approvals FOR UPDATE 
USING (approver_id = auth.uid());

CREATE POLICY "System can create approvals" 
ON document_approvals FOR INSERT 
WITH CHECK (true);

-- RLS-Policies für document_signatures
CREATE POLICY "Users can view signatures for accessible documents" 
ON document_signatures FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_signatures.document_id 
    AND (d.created_by = auth.uid() OR d.status = 'approved')
  )
  OR signer_id = auth.uid()
);

CREATE POLICY "Users can create their own signatures" 
ON document_signatures FOR INSERT 
WITH CHECK (signer_id = auth.uid());

-- RLS-Policies für document_approval_rules
CREATE POLICY "Admins can manage approval rules" 
ON document_approval_rules FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Users can view approval rules" 
ON document_approval_rules FOR SELECT 
USING (true);

-- Trigger für automatische Genehmigungsanfragen
CREATE OR REPLACE FUNCTION create_approval_requests()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  approver_id uuid;
BEGIN
  -- Prüfe ob Genehmigung erforderlich ist
  IF NEW.requires_approval = true AND NEW.approval_status = 'pending' THEN
    -- Hole passende Genehmigungsregeln
    FOR rule IN 
      SELECT * FROM document_approval_rules 
      WHERE document_category = NEW.category 
      AND (company_id IS NULL OR company_id = get_user_company_id(NEW.created_by))
      AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    LOOP
      -- Erstelle Genehmigungsanfragen für alle erforderlichen Rollen
      FOR approver_id IN 
        SELECT ur.user_id 
        FROM user_roles ur 
        WHERE ur.role = ANY(rule.required_roles)
        AND (ur.company_id = get_user_company_id(NEW.created_by) OR rule.company_id IS NULL)
        LIMIT rule.minimum_approvers
      LOOP
        INSERT INTO document_approvals (document_id, approver_id)
        VALUES (NEW.id, approver_id);
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER document_approval_trigger
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION create_approval_requests();

-- Funktion zum Aktualisieren des Dokumenten-Status nach Genehmigung
CREATE OR REPLACE FUNCTION update_document_approval_status()
RETURNS TRIGGER AS $$
DECLARE
  doc_id uuid := NEW.document_id;
  pending_count integer;
  total_count integer;
BEGIN
  -- Zähle ausstehende und gesamte Genehmigungen
  SELECT COUNT(*) INTO pending_count 
  FROM document_approvals 
  WHERE document_id = doc_id AND status = 'pending';
  
  SELECT COUNT(*) INTO total_count 
  FROM document_approvals 
  WHERE document_id = doc_id;
  
  -- Aktualisiere Dokumenten-Status
  IF NEW.status = 'rejected' THEN
    UPDATE documents 
    SET approval_status = 'rejected' 
    WHERE id = doc_id;
  ELSIF pending_count = 0 AND total_count > 0 THEN
    -- Alle Genehmigungen erhalten
    UPDATE documents 
    SET approval_status = 'approved',
        approved_by = NEW.approver_id,
        approved_at = now()
    WHERE id = doc_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER approval_status_trigger
  AFTER UPDATE ON document_approvals
  FOR EACH ROW EXECUTE FUNCTION update_document_approval_status();