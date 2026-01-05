
import { useState } from 'react';
import { CompanyDetails } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCompanyInfo = (company: CompanyDetails) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: company.name,
    address: company.address || '',
    contact_person: company.contact_person || '',
    billing_email: company.billing_email || '',
    phone: company.phone || '',
    website: company.website || '',
    tax_id: company.tax_id || '',
    vat_id: company.vat_id || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Hier würde normalerweise ein API-Call stattfinden
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({
        title: "Änderungen gespeichert",
        description: "Die Firmeninformationen wurden erfolgreich aktualisiert."
      });
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      name: company.name,
      address: company.address || '',
      contact_person: company.contact_person || '',
      billing_email: company.billing_email || '',
      phone: company.phone || '',
      website: company.website || '',
      tax_id: company.tax_id || '',
      vat_id: company.vat_id || ''
    });
    setIsEditing(false);
  };

  const handleEdit = () => setIsEditing(true);

  return {
    isEditing,
    isSaving,
    formData,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit
  };
};
