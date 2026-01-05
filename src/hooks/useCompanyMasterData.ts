import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyMasterData {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  brand_font?: string;
  legal_form?: string;
  founding_date?: string;
  trade_register_number?: string;
  tax_id?: string;
  vat_id?: string;
  industry_code?: string;
  industry_description?: string;
}

export const useCompanyMasterData = () => {
  const { toast } = useToast();
  const [data, setData] = useState<CompanyMasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const { data: companyData, error } = await supabase
        .from('companies')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setData(companyData);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyData = async (updates: Partial<CompanyMasterData>) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', data?.id);

      if (error) {
        throw error;
      }

      setData(current => current ? { ...current, ...updates } : null);
      
      toast({
        title: "Stammdaten aktualisiert",
        description: "Die Unternehmensstammdaten wurden erfolgreich gespeichert.",
      });
    } catch (err) {
      console.error('Error updating company data:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  return {
    data,
    loading,
    error,
    updateCompanyData,
    refetch: fetchCompanyData
  };
};