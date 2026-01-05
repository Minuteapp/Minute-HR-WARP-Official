import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Target, Lightbulb } from "lucide-react";
import { OverviewTab } from "./overview/OverviewTab";
import { MyTeamTab } from "./my-team/MyTeamTab";
import { PersonnelDemandTab } from "./personnel-demand/PersonnelDemandTab";
import { MeasuresTab } from "./measures/MeasuresTab";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

export const PersonalplanungDashboard = () => {
  const { hasAction } = useEnterprisePermissions();
  
  // Berechtigungen basierend auf Rolle
  const canViewOverview = hasAction('workforce-planning', 'read') || hasAction('workforce-planning', 'update');
  const canViewMyTeam = hasAction('workforce-planning', 'read') || hasAction('workforce-planning', 'update');
  const canViewPersonnelDemand = hasAction('workforce-planning', 'update') || hasAction('workforce-planning', 'approve');
  const canViewMeasures = hasAction('workforce-planning', 'update') || hasAction('workforce-planning', 'approve');

  // Bestimme Default-Tab basierend auf Berechtigungen
  const getDefaultTab = () => {
    if (canViewOverview) return "overview";
    if (canViewMyTeam) return "my-team";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Wechsle Tab wenn aktueller nicht mehr sichtbar
  useEffect(() => {
    const tabPermissions: Record<string, boolean> = {
      'overview': canViewOverview,
      'my-team': canViewMyTeam,
      'personnel-demand': canViewPersonnelDemand,
      'measures': canViewMeasures,
    };
    
    if (!tabPermissions[activeTab]) {
      setActiveTab(getDefaultTab());
    }
  }, [canViewOverview, canViewMyTeam, canViewPersonnelDemand, canViewMeasures, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Personalplanung</h1>
              <p className="text-sm text-muted-foreground">Strategische Workforce-Planung und Kapazitätsmanagement</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {canViewOverview && (
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Übersicht
              </TabsTrigger>
            )}
            {canViewMyTeam && (
              <TabsTrigger 
                value="my-team"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Mein Team
              </TabsTrigger>
            )}
            {canViewPersonnelDemand && (
              <TabsTrigger 
                value="personnel-demand"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Personalbedarf
              </TabsTrigger>
            )}
            {canViewMeasures && (
              <TabsTrigger 
                value="measures"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Maßnahmen
              </TabsTrigger>
            )}
          </TabsList>

          {canViewOverview && (
            <TabsContent value="overview" className="mt-6">
              <OverviewTab />
            </TabsContent>
          )}

          {canViewMyTeam && (
            <TabsContent value="my-team" className="mt-6">
              <MyTeamTab />
            </TabsContent>
          )}

          {canViewPersonnelDemand && (
            <TabsContent value="personnel-demand" className="mt-6">
              <PersonnelDemandTab />
            </TabsContent>
          )}

          {canViewMeasures && (
            <TabsContent value="measures" className="mt-6">
              <MeasuresTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
