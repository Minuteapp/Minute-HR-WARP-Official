
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

// Erweiterte CompanyInformation-Schnittstelle
export interface CompanyInformation {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  description?: string;
  logo_url?: string;
  tax_id?: string;
  vat_id?: string;
  
  // Rechtliche Informationen
  legal_representative?: string;
  imprint_url?: string;
  privacy_policy_url?: string;
  terms_url?: string;
  registration_number?: string;
  registration_court?: string;
  
  // Struktur & Organisation
  departments?: string[];
}

// Typ für die Daten, die aktualisiert werden
export type CompanyInformationFormData = Partial<CompanyInformation>;

// Typ für Tochtergesellschaften
export interface Subsidiary {
  id: string;
  name: string;
  legal_form: string;
  address: string;
  tax_id: string;
  contact_person: string;
  status: 'active' | 'inactive';
}

// Typ für neue Tochtergesellschaften
export type SubsidiaryFormData = Omit<Subsidiary, 'id'>;

export const useCompanyInformation = () => {
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  
  const [companyInfo, setCompanyInfo] = useState<CompanyInformation>({});
  const [isLoadingCompanyInfo, setIsLoadingCompanyInfo] = useState(true);
  const [isUpdatingCompanyInfo, setIsUpdatingCompanyInfo] = useState(false);
  
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [isLoadingSubsidiaries, setIsLoadingSubsidiaries] = useState(false);
  const [isAddingSubsidiary, setIsAddingSubsidiary] = useState(false);
  const [isDeletingSubsidiary, setIsDeletingSubsidiary] = useState(false);

  // Lade Unternehmensinformationen aus der DB
  useEffect(() => {
    const loadCompanyInfo = async () => {
      if (!companyId) {
        setIsLoadingCompanyInfo(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setCompanyInfo({
            id: data.id,
            name: data.name,
            address: data.address,
            city: data.city,
            postal_code: data.postal_code,
            country: data.country,
            phone: data.phone,
            email: data.email,
            website: data.website,
            industry: data.industry,
            size: data.size,
            description: data.description,
            logo_url: data.logo_url,
            tax_id: data.tax_id,
            vat_id: data.vat_id,
            legal_representative: data.legal_representative,
            registration_number: data.registration_number,
            registration_court: data.registration_court,
            departments: data.departments || []
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Unternehmensinformationen:', error);
      } finally {
        setIsLoadingCompanyInfo(false);
      }
    };
    
    loadCompanyInfo();
  }, [companyId]);

  // Funktion zum Aktualisieren der Unternehmensinformationen
  const updateCompanyInfo = async (formData: CompanyInformationFormData) => {
    if (!companyId) return false;
    
    setIsUpdatingCompanyInfo(true);
    
    try {
      const { error } = await supabase
        .from('companies')
        .update(formData)
        .eq('id', companyId);
      
      if (error) throw error;
      
      setCompanyInfo(prev => ({
        ...prev,
        ...formData
      }));
      
      toast({
        title: "Unternehmensinformationen aktualisiert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Unternehmensinformationen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Unternehmensinformationen konnten nicht aktualisiert werden.",
      });
      throw error;
    } finally {
      setIsUpdatingCompanyInfo(false);
    }
  };

  // Funktion zum Laden der Tochtergesellschaften
  const loadSubsidiaries = async () => {
    if (!companyId) return false;
    
    setIsLoadingSubsidiaries(true);
    try {
      const { data, error } = await supabase
        .from('subsidiaries')
        .select('*')
        .eq('parent_company_id', companyId)
        .order('name');
      
      if (error) throw error;
      
      setSubsidiaries((data || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        legal_form: sub.legal_form || '',
        address: sub.address || '',
        tax_id: sub.tax_id || '',
        contact_person: sub.contact_person || '',
        status: sub.status || 'active'
      })));
      
      return true;
    } catch (error) {
      console.error('Fehler beim Laden der Tochtergesellschaften:', error);
      setSubsidiaries([]);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Tochtergesellschaften konnten nicht geladen werden.",
      });
      throw error;
    } finally {
      setIsLoadingSubsidiaries(false);
    }
  };

  // Funktion zum Hinzufügen einer Tochtergesellschaft
  const addSubsidiary = async (data: SubsidiaryFormData) => {
    if (!companyId) return null;
    
    setIsAddingSubsidiary(true);
    try {
      const { data: newData, error } = await supabase
        .from('subsidiaries')
        .insert({
          parent_company_id: companyId,
          name: data.name,
          legal_form: data.legal_form,
          address: data.address,
          tax_id: data.tax_id,
          contact_person: data.contact_person,
          status: data.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSubsidiary: Subsidiary = {
        id: newData.id,
        name: newData.name,
        legal_form: newData.legal_form || '',
        address: newData.address || '',
        tax_id: newData.tax_id || '',
        contact_person: newData.contact_person || '',
        status: newData.status || 'active'
      };
      
      setSubsidiaries(prev => [...prev, newSubsidiary]);
      
      toast({
        title: "Tochtergesellschaft hinzugefügt",
        description: `${data.name} wurde erfolgreich hinzugefügt.`,
      });
      
      return newSubsidiary;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Tochtergesellschaft:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Tochtergesellschaft konnte nicht hinzugefügt werden.",
      });
      throw error;
    } finally {
      setIsAddingSubsidiary(false);
    }
  };

  // Funktion zum Löschen einer Tochtergesellschaft
  const deleteSubsidiary = async (id: string) => {
    setIsDeletingSubsidiary(true);
    try {
      const { error } = await supabase
        .from('subsidiaries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSubsidiaries(prev => prev.filter(sub => sub.id !== id));
      
      toast({
        title: "Tochtergesellschaft gelöscht",
        description: "Die Tochtergesellschaft wurde erfolgreich gelöscht.",
      });
      
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Tochtergesellschaft:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Tochtergesellschaft konnte nicht gelöscht werden.",
      });
      throw error;
    } finally {
      setIsDeletingSubsidiary(false);
    }
  };

  return {
    companyInfo,
    isLoadingCompanyInfo,
    updateCompanyInfo,
    isUpdatingCompanyInfo,
    subsidiaries,
    isLoadingSubsidiaries,
    loadSubsidiaries,
    addSubsidiary,
    deleteSubsidiary,
    isAddingSubsidiary,
    isDeletingSubsidiary
  };
};
