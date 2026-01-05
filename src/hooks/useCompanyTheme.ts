import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyTheme {
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  brand_font: string;
}

export const useCompanyTheme = (companyId?: string) => {
  const [theme, setTheme] = useState<CompanyTheme>({
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    brand_font: 'Inter'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyTheme = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('logo_url, primary_color, secondary_color, brand_font')
          .eq('id', companyId)
          .single();

        if (error) {
          console.error('Error fetching company theme:', error);
          return;
        }

        if (data) {
          // Fallback-Werte für neue Firmen ohne Branding (NULL-Werte erlaubt)
          const primaryColor = data.primary_color || '#3B82F6';
          const secondaryColor = data.secondary_color || '#1E40AF';
          const brandFont = data.brand_font || 'Inter';
          
          setTheme({
            logo_url: data.logo_url,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            brand_font: brandFont
          });

          // CSS-Variablen für das Theme setzen
          const root = document.documentElement;
          root.style.setProperty('--company-primary', primaryColor);
          root.style.setProperty('--company-secondary', secondaryColor);
          root.style.setProperty('--company-font', brandFont);
        }
      } catch (error) {
        console.error('Error fetching company theme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyTheme();
  }, [companyId]);

  return { theme, loading };
};