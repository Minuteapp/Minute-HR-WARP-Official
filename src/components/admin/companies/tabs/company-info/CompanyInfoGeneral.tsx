
import React from 'react';
import { CompanyDetails } from '../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GeneralInfoProps {
  company?: CompanyDetails;
  formData?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

export const CompanyInfoGeneral: React.FC<GeneralInfoProps> = ({ 
  company, 
  formData, 
  onChange, 
  isEditing 
}) => {
  if (isEditing && formData && onChange) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="name">Firmenname</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={onChange}
          />
        </div>
      </>
    );
  }

  if (company) {
    return (
      <div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Firmenname</p>
            <p>{company.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Adresse</p>
            <p>{company.address || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mitarbeiteranzahl</p>
            <p>{company.employee_count || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p>{company.is_active ? "Aktiv" : "Inaktiv"}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
