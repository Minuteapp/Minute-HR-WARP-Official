import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  brand_font: string;
}

interface CompanyContextType {
  currentCompany: Company | null;
  loading: boolean;
  refetchCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserCompany = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is Superadmin first
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      // Superadmins don't need a company context
      if (roleData?.role === 'superadmin') {
        console.log('🦸 Superadmin detected - skipping company loading');
        setCurrentCompany(null);
        setLoading(false);
        return;
      }

      // Hole die Firma des Benutzers über die user_roles Tabelle
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          company_id,
          companies!inner(
            id,
            name,
            logo_url,
            primary_color,
            secondary_color,
            brand_font
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        setLoading(false);
        return;
      }

      if (userRole?.companies) {
        const company = userRole.companies as any;
        
        // Fallback-Werte für neue Firmen ohne Branding (NULL-Werte erlaubt)
        const primaryColor = company.primary_color || '#3B82F6';
        const secondaryColor = company.secondary_color || '#1E40AF';
        const brandFont = company.brand_font || 'Inter';
        
        setCurrentCompany({
          id: company.id,
          name: company.name,
          logo_url: company.logo_url,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          brand_font: brandFont
        });

        // Setze CSS-Variablen für das firmenspezifische Theme
        const root = document.documentElement;
        root.style.setProperty('--company-primary', primaryColor);
        root.style.setProperty('--company-secondary', secondaryColor);
        root.style.setProperty('--company-font', brandFont);
      }
    } catch (error) {
      console.error('Error fetching user company:', error);
    } finally {
      setLoading(false);
    }
  };

  const refetchCompany = () => {
    fetchUserCompany();
  };

  useEffect(() => {
    fetchUserCompany();
  }, [user?.id]);

  return (
    <CompanyContext.Provider value={{ currentCompany, loading, refetchCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};