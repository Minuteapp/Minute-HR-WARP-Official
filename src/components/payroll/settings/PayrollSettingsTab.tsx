import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Euro, Building2, Key, Bell, Link2 } from "lucide-react";
import { BenefitsSettingsTab } from "./BenefitsSettingsTab";
import { PayTypesSettingsTab } from "./PayTypesSettingsTab";
import { CompanySettingsTab } from "./CompanySettingsTab";
import { AccessRightsSettingsTab } from "./AccessRightsSettingsTab";
import { NotificationsSettingsTab } from "./NotificationsSettingsTab";
import { IntegrationsSettingsTab } from "./IntegrationsSettingsTab";

export const PayrollSettingsTab = () => {
  const [activeTab, setActiveTab] = useState("benefits");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">Payroll-Konfiguration & Verwaltung</p>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg gap-1">
          <TabsTrigger 
            value="benefits"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Gift className="h-4 w-4 mr-2" />
            Zusatzleistungen
          </TabsTrigger>
          <TabsTrigger 
            value="paytypes"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Euro className="h-4 w-4 mr-2" />
            Lohnarten
          </TabsTrigger>
          <TabsTrigger 
            value="company"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Unternehmen
          </TabsTrigger>
          <TabsTrigger 
            value="access"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Key className="h-4 w-4 mr-2" />
            Zugriffsrechte
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            className="px-4 py-2 rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Schnittstellen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="benefits" className="mt-6">
          <BenefitsSettingsTab />
        </TabsContent>

        <TabsContent value="paytypes" className="mt-6">
          <PayTypesSettingsTab />
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <CompanySettingsTab />
        </TabsContent>

        <TabsContent value="access" className="mt-6">
          <AccessRightsSettingsTab />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsSettingsTab />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <IntegrationsSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
