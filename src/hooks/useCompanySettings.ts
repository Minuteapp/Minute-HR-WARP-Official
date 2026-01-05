
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompanySettings } from '@/types/company.types';

export const useCompanySettings = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanySettings>({
    name: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    primaryColor: '#9b87f5',
    secondaryColor: '',
    fontHeading: '',
    fontBody: ''
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Fehler beim Laden der Einstellungen",
          description: error.message
        });
        return null;
      }

      if (data) {
        const formattedData: CompanySettings = {
          id: data.id,
          name: data.name,
          street: data.street || '',
          postalCode: data.postal_code || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logoUrl: data.logo_url || '',
          primaryColor: data.primary_color || '#9b87f5',
          secondaryColor: data.secondary_color || '',
          fontHeading: data.font_heading || '',
          fontBody: data.font_body || ''
        };
        setFormData(formattedData);
        return formattedData;
      }
      return null;
    }
  });

  const handleInputChange = (key: keyof CompanySettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (!settings?.id) return;

    const { error } = await supabase
      .from('company_settings')
      .update({
        name: formData.name,
        street: formData.street,
        postal_code: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo_url: formData.logoUrl,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        font_heading: formData.fontHeading,
        font_body: formData.fontBody
      })
      .eq('id', settings.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message
      });
      return;
    }

    toast({
      title: "Einstellungen gespeichert",
      description: "Die Unternehmenseinstellungen wurden erfolgreich aktualisiert."
    });
  };

  return {
    formData,
    settings,
    isLoading,
    handleInputChange,
    handleSave
  };
};
