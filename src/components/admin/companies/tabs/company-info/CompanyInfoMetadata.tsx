
import React from 'react';
import { CompanyDetails } from '../../types';
import { formatDate } from '@/lib/utils';

interface MetadataProps {
  company: CompanyDetails;
}

export const CompanyInfoMetadata: React.FC<MetadataProps> = ({ company }) => {
  return (
    <div className="border border-primary rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium">Metadaten</h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Erstellt am</p>
          <p>{formatDate(company.created_at)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Zuletzt aktualisiert</p>
          <p>{formatDate(company.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};
