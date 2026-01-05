import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  address: string | null;
  website: string | null;
  phone: string | null;
  employee_count: number;
  subscription_status: string;
  is_active: boolean;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  billing_email: string | null;
}

export const useCompaniesOverview = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      
      // Nutze die sichere RPC-Funktion (SECURITY DEFINER, prüft SuperAdmin-Rolle)
      const { data, error } = await supabase.rpc('get_active_companies');

      if (error) {
        console.error('Error loading companies:', error);
        toast({
          title: 'Fehler beim Laden',
          description: 'Die Firmen konnten nicht geladen werden.',
          variant: 'destructive'
        });
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error in loadCompanies:', error);
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return {
    companies,
    isLoading,
    refetch: loadCompanies
  };
};
