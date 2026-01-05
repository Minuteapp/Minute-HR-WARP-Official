import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network } from "lucide-react";
import { OverviewTab } from "./tabs/OverviewTab";
import { OrganizationChartTab } from "./tabs/OrganizationChartTab";
import { DepartmentsTab } from "./tabs/DepartmentsTab";
import { RolesTab } from "./tabs/RolesTab";
import { SuccessionPlanningTab } from "./tabs/SuccessionPlanningTab";
import { ScenariosTab } from "./tabs/ScenariosTab";

export const OrganizationDesignDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Network className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Organisationsdesign</h1>
              <p className="text-sm text-muted-foreground">Strukturplanung, Nachfolge und Reorganisation</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="chart"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Organigramm
            </TabsTrigger>
            <TabsTrigger 
              value="departments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Abteilungen
            </TabsTrigger>
            <TabsTrigger 
              value="roles"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Rollen
            </TabsTrigger>
            <TabsTrigger 
              value="succession"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Nachfolge
            </TabsTrigger>
            <TabsTrigger 
              value="scenarios"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Szenarien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="chart" className="mt-6">
            <OrganizationChartTab />
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <DepartmentsTab />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RolesTab />
          </TabsContent>

          <TabsContent value="succession" className="mt-6">
            <SuccessionPlanningTab />
          </TabsContent>

          <TabsContent value="scenarios" className="mt-6">
            <ScenariosTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};