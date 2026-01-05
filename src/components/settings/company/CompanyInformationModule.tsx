import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyMasterData } from './CompanyMasterData';
import { CompanyOrganization } from './CompanyOrganization';
import { CompanyLegal } from './CompanyLegal';
import { CompanyLocations } from './CompanyLocations';
import { CompanyCommunication } from './CompanyCommunication';
import { CompanyReports } from './CompanyReports';

export const CompanyInformationModule = () => {
  const [activeTab, setActiveTab] = useState("master-data");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Unternehmensinformationen</h2>
        <p className="text-muted-foreground">
          Verwalten Sie alle wichtigen Informationen Ihres Unternehmens zentral an einem Ort.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unternehmensdaten verwalten</CardTitle>
          <CardDescription>
            Organisieren Sie Stammdaten, Struktur, rechtliche Dokumente, Standorte und Kommunikationswege.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="master-data">Stammdaten</TabsTrigger>
              <TabsTrigger value="organization">Organisation</TabsTrigger>
              <TabsTrigger value="legal">Rechtliches</TabsTrigger>
              <TabsTrigger value="locations">Standorte</TabsTrigger>
              <TabsTrigger value="communication">Kommunikation</TabsTrigger>
              <TabsTrigger value="reports">Berichte</TabsTrigger>
            </TabsList>

            <TabsContent value="master-data" className="mt-6">
              <CompanyMasterData />
            </TabsContent>

            <TabsContent value="organization" className="mt-6">
              <CompanyOrganization />
            </TabsContent>

            <TabsContent value="legal" className="mt-6">
              <CompanyLegal />
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              <CompanyLocations />
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <CompanyCommunication />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <CompanyReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};