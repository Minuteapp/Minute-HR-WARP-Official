
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompanySettings } from "../hooks/useCompanySettings";
import { CompanyDataForm } from './CompanyDataForm';
import { CompanyBranding } from './CompanyBranding';
import { ImportExport } from './ImportExport';

export const CompanyDetails = () => {
  const [activeTab, setActiveTab] = useState('allgemein');

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Unternehmensdetails</CardTitle>
      </CardHeader>
      
      <div className="border-b px-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('allgemein')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allgemein' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Allgemeine Daten
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Corporate Identity
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Import/Export
          </button>
        </div>
      </div>

      <CardContent className="pt-6">
        {activeTab === 'allgemein' && <CompanyDataForm />}
        {activeTab === 'branding' && <CompanyBranding />}
        {activeTab === 'import' && <ImportExport />}
      </CardContent>
    </Card>
  );
};
