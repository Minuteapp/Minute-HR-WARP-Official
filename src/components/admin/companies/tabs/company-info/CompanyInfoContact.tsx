
import React from 'react';
import { CompanyDetails } from '../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactInfoProps {
  company?: CompanyDetails;
  formData?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

export const CompanyInfoContact: React.FC<ContactInfoProps> = ({ 
  company, 
  formData, 
  onChange, 
  isEditing 
}) => {
  if (isEditing && formData && onChange) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="contact_person">Ansprechpartner</Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing_email">E-Mail</Label>
          <Input
            id="billing_email"
            name="billing_email"
            type="email"
            value={formData.billing_email}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={onChange}
          />
        </div>
      </>
    );
  }

  if (company) {
    return (
      <div>
        <h3 className="text-lg font-medium">Kontaktinformationen</h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Ansprechpartner</p>
            <p>{company.contact_person || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">E-Mail</p>
            <p>{company.billing_email || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Telefon</p>
            <p>{company.phone || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Website</p>
            <p>{company.website || "Nicht angegeben"}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
