
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyDataForm } from './CompanyDataForm';
import { CompanyBranding } from './CompanyBranding';
import { ImportExport } from './ImportExport';
import { CompanyLegalInformation } from './CompanyLegalInformation';
import { CompanyStructure } from './CompanyStructure';
import { CompanyIntegrations } from './CompanyIntegrations';

export const CompanyInformationTabs = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
      <div className="overflow-x-auto">
        <TabsList className="mb-6 flex flex-nowrap min-w-max">
          <TabsTrigger value="general" className="whitespace-nowrap">Allgemeine Daten</TabsTrigger>
          <TabsTrigger value="legal" className="whitespace-nowrap">Rechtliche Informationen</TabsTrigger>
          <TabsTrigger value="branding" className="whitespace-nowrap">Corporate Identity</TabsTrigger>
          <TabsTrigger value="structure" className="whitespace-nowrap">Struktur & Organisation</TabsTrigger>
          <TabsTrigger value="integrations" className="whitespace-nowrap">Integrationen</TabsTrigger>
          <TabsTrigger value="import" className="whitespace-nowrap">Import/Export</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general" className="mt-6">
        <CompanyDataForm />
      </TabsContent>
      
      <TabsContent value="legal" className="mt-6">
        <CompanyLegalInformation />
      </TabsContent>
      
      <TabsContent value="branding" className="mt-6">
        <CompanyBranding />
      </TabsContent>
      
      <TabsContent value="structure" className="mt-6">
        <CompanyStructure />
      </TabsContent>
      
      <TabsContent value="integrations" className="mt-6">
        <CompanyIntegrations />
      </TabsContent>
      
      <TabsContent value="import" className="mt-6">
        <ImportExport />
      </TabsContent>
    </Tabs>
  );
};
