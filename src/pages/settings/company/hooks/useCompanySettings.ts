
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CompanyFormData {
  name: string;
  address: string;
  contact_person: string;
  billing_email: string;
  phone: string;
  website: string;
  tax_id: string;
  vat_id: string;
}

export const useCompanySettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    address: '',
    contact_person: '',
    billing_email: '',
    phone: '',
    website: '',
    tax_id: '',
    vat_id: ''
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
        description: "Die Unternehmensinformationen wurden erfolgreich aktualisiert."
      });
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      address: '',
      contact_person: '',
      billing_email: '',
      phone: '',
      website: '',
      tax_id: '',
      vat_id: ''
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
