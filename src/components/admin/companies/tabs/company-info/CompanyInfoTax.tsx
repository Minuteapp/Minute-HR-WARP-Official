
import React from 'react';
import { CompanyDetails } from '../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaxInfoProps {
  company?: CompanyDetails;
  formData?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

export const CompanyInfoTax: React.FC<TaxInfoProps> = ({ 
  company, 
  formData, 
  onChange, 
  isEditing 
}) => {
  if (isEditing && formData && onChange) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="tax_id">Steuernummer</Label>
          <Input
            id="tax_id"
            name="tax_id"
            value={formData.tax_id}
            onChange={onChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_id">USt-ID</Label>
          <Input
            id="vat_id"
            name="vat_id"
            value={formData.vat_id}
            onChange={onChange}
          />
        </div>
      </>
    );
  }

  if (company) {
    return (
      <div>
        <h3 className="text-lg font-medium">Steuerdaten</h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Steuernummer</p>
            <p>{company.tax_id || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">USt-ID</p>
            <p>{company.vat_id || "Nicht angegeben"}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
