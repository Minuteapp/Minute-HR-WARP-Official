import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyCompliance {
  id: string;
  company_id: string;
  compliance_type: string;
  title: string;
  description?: string;
  regulation_reference?: string;
  certification_body?: string;
  certificate_number?: string;
  valid_from?: string;
  valid_until?: string;
  reminder_days_before: number;
  status: 'active' | 'warning' | 'critical' | 'expired';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  responsible_person_id?: string;
  audit_frequency: string;
  last_audit_date?: string;
  next_audit_date?: string;
  compliance_score: number;
  action_items: any[];
  documents: any[];
  created_at: string;
  updated_at: string;
}

interface LegalDocument {
  id: string;
  company_id: string;
  document_type: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  version: string;
  is_current_version: boolean;
  valid_from?: string;
  valid_until?: string;
  reminder_days_before: number;
  compliance_category?: string;
  approval_status: 'draft' | 'approved' | 'expired';
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCompanyLegal = () => {
  const { toast } = useToast();
  const [compliance, setCompliance] = useState<CompanyCompliance[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_compliance')
        .select('*')
        .order('compliance_score', { ascending: false });

      if (error) {
        throw error;
      }

      setCompliance(data || []);
    } catch (err) {
      console.error('Error fetching compliance:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('company_legal_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const addComplianceItem = async (complianceData: Omit<CompanyCompliance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('company_compliance')
        .insert([complianceData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCompliance(current => [data, ...current]);
      
      toast({
        title: "Compliance-Vorgabe hinzugefügt",
        description: "Die neue Compliance-Vorgabe wurde erfolgreich erstellt.",
      });

      return data;
    } catch (err) {
      console.error('Error adding compliance:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Hinzufügen",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const updateComplianceItem = async (id: string, updates: Partial<CompanyCompliance>) => {
    try {
      const { error } = await supabase
        .from('company_compliance')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setCompliance(current => 
        current.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
      toast({
        title: "Compliance aktualisiert",
        description: "Die Compliance-Vorgabe wurde erfolgreich gespeichert.",
      });
    } catch (err) {
      console.error('Error updating compliance:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const addDocument = async (documentData: Omit<LegalDocument, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('company_legal_documents')
        .insert([documentData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDocuments(current => [data, ...current]);
      
      toast({
        title: "Dokument hinzugefügt",
        description: "Das rechtliche Dokument wurde erfolgreich hochgeladen.",
      });

      return data;
    } catch (err) {
      console.error('Error adding document:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Hochladen",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  const updateDocument = async (id: string, updates: Partial<LegalDocument>) => {
    try {
      const { error } = await supabase
        .from('company_legal_documents')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      setDocuments(current => 
        current.map(doc => 
          doc.id === id ? { ...doc, ...updates } : doc
        )
      );
      
      toast({
        title: "Dokument aktualisiert",
        description: "Das Dokument wurde erfolgreich gespeichert.",
      });
    } catch (err) {
      console.error('Error updating document:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCompliance();
    fetchDocuments();
  }, []);

  return {
    compliance,
    documents,
    loading,
    error,
    addComplianceItem,
    updateComplianceItem,
    addDocument,
    updateDocument,
    refetch: () => {
      fetchCompliance();
      fetchDocuments();
    }
  };
};