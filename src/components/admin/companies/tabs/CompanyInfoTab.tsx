
import React from 'react';
import { CompanyDetails } from '../types';
import { CompanyInfoGeneral } from './company-info/CompanyInfoGeneral';
import { CompanyInfoContact } from './company-info/CompanyInfoContact';
import { CompanyInfoTax } from './company-info/CompanyInfoTax';
import { CompanyInfoSubscription } from './company-info/CompanyInfoSubscription';
import { CompanyInfoMetadata } from './company-info/CompanyInfoMetadata';
import { CompanyInfoEditor } from './company-info/CompanyInfoEditor';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

export interface CompanyInfoTabProps {
  company: CompanyDetails;
}

export const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ company }) => {
  const {
    isEditing,
    isSaving,
    formData,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit
  } = useCompanyInfo(company);

  if (!company) return <div>Keine Firmeninformationen verfügbar</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Allgemeine Informationen</h3>
        {isEditing ? (
          <CompanyInfoEditor 
            onCancel={handleCancel} 
            onSave={handleSave} 
            isSaving={isSaving} 
          />
        ) : (
          <CompanyInfoEditor 
            isEditMode={false} 
            onEdit={handleEdit} 
          />
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompanyInfoGeneral formData={formData} onChange={handleChange} isEditing={true} />
          <CompanyInfoContact formData={formData} onChange={handleChange} isEditing={true} />
          <CompanyInfoTax formData={formData} onChange={handleChange} isEditing={true} />
        </div>
      ) : (
        <>
          <CompanyInfoGeneral company={company} isEditing={false} />
          <CompanyInfoContact company={company} isEditing={false} />
          <CompanyInfoTax company={company} isEditing={false} />
          <CompanyInfoSubscription company={company} />
          <CompanyInfoMetadata company={company} />
        </>
      )}
    </div>
  );
};
