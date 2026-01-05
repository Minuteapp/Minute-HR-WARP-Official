// Build refresh trigger - 2025-12-20
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Network, Languages, Shield, Users, Brain, Bell, Link, Monitor, Flag } from 'lucide-react';
import BrandingIdentityTab from './tabs/BrandingIdentityTab';
import OrganizationStructureTab from './tabs/OrganizationStructureTab';
import LanguageRegionTab from './tabs/LanguageRegionTab';
import ComplianceLegalTab from './tabs/ComplianceLegalTab';
import RolesSecurityTab from './tabs/RolesSecurityTab';
import AIConfigurationTab from './tabs/AIConfigurationTab';
import NotificationsCommunicationTab from './tabs/NotificationsCommunicationTab';
import IntegrationsAPITab from './tabs/IntegrationsAPITab';
import DevicesPlatformsTab from './tabs/DevicesPlatformsTab';
import PlatformFeatureFlagsTab from './tabs/PlatformFeatureFlagsTab';

export const GlobalSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Globale Einstellungen</h1>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-10 h-auto">
          <TabsTrigger value="branding" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Building2 className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Network className="h-4 w-4" />
            <span>Organisation</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Languages className="h-4 w-4" />
            <span>Sprache</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Users className="h-4 w-4" />
            <span>Rollen</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Brain className="h-4 w-4" />
            <span>KI</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Bell className="h-4 w-4" />
            <span>Benachricht.</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Link className="h-4 w-4" />
            <span>Schnittstellen</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Monitor className="h-4 w-4" />
            <span>Geräte</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex flex-col items-center gap-1 py-2 text-xs">
            <Flag className="h-4 w-4" />
            <span>Plattform</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="branding"><BrandingIdentityTab /></TabsContent>
          <TabsContent value="organization"><OrganizationStructureTab /></TabsContent>
          <TabsContent value="language"><LanguageRegionTab /></TabsContent>
          <TabsContent value="compliance"><ComplianceLegalTab /></TabsContent>
          <TabsContent value="roles"><RolesSecurityTab /></TabsContent>
          <TabsContent value="ai"><AIConfigurationTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsCommunicationTab /></TabsContent>
          <TabsContent value="integrations"><IntegrationsAPITab /></TabsContent>
          <TabsContent value="devices"><DevicesPlatformsTab /></TabsContent>
          <TabsContent value="platform"><PlatformFeatureFlagsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
