import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Network, Building, MapPin, Users, UserCog, Shield } from 'lucide-react';
import { CompanyProfileTab } from '@/components/settings/company-information/tabs/CompanyProfileTab';
import { HoldingStructureTab } from '@/components/settings/company-information/tabs/HoldingStructureTab';
import { SubsidiariesTab } from '@/components/settings/company-information/tabs/SubsidiariesTab';
import { LocationsTab } from '@/components/settings/company-information/tabs/LocationsTab';
import { DepartmentsTab } from '@/components/settings/company-information/tabs/DepartmentsTab';
import { TeamsTab } from '@/components/settings/company-information/tabs/TeamsTab';
import { AdminsTab } from '@/components/settings/company-information/tabs/AdminsTab';
import { SettingsPermissionGuard } from '@/components/settings/SettingsPermissionGuard';

export default function CompanyInformationPage() {
  return (
    <SettingsPermissionGuard moduleId="company-info">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unternehmensinformationen</h1>
            <p className="text-muted-foreground mt-1">
              Zentrale Verwaltung aller Unternehmensstrukturen und -daten
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="holding" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Holding</span>
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Gesellschaften</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2 data-[state=active]:bg-background">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Standorte</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Abteilungen</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2 data-[state=active]:bg-background">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Administratoren</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <CompanyProfileTab />
          </TabsContent>

          <TabsContent value="holding" className="mt-0">
            <HoldingStructureTab />
          </TabsContent>

          <TabsContent value="subsidiaries" className="mt-0">
            <SubsidiariesTab />
          </TabsContent>

          <TabsContent value="locations" className="mt-0">
            <LocationsTab />
          </TabsContent>

          <TabsContent value="departments" className="mt-0">
            <DepartmentsTab />
          </TabsContent>

          <TabsContent value="teams" className="mt-0">
            <TeamsTab />
          </TabsContent>

          <TabsContent value="admins" className="mt-0">
            <AdminsTab />
          </TabsContent>
        </Tabs>
      </div>
    </SettingsPermissionGuard>
  );
}
