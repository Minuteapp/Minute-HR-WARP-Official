import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SickLeaveOverview from './SickLeaveOverview';
import SickLeaveLiveMonitor from './SickLeaveLiveMonitor';
import SickLeaveStatistics from './SickLeaveStatistics';
import SickLeaveSettings from './SickLeaveSettings';
import { MySickLeaves } from './employee/MySickLeaves';
import { TeamSickLeaveOverview } from './TeamSickLeaveOverview';
import TeamOverviewTab from './TeamOverviewTab';
import { useSickLeavePermissions } from '@/hooks/sick-leave/useSickLeavePermissions';

const ModernSickLeaveDashboard = () => {
  const { 
    currentRole,
    roleDisplayName,
    canViewAll,
    canViewTeamOverview,
    canViewLiveMonitor,
    canViewStatistics,
    canManageSettings,
    isLoading 
  } = useSickLeavePermissions();

  // Default Tab basierend auf Rolle
  const defaultTab = canViewAll ? 'overview' : 'my-sick-leaves';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Lade...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header - Pulse Surveys Style */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Krankmeldungen</h1>
                <Badge variant="outline" className="text-xs">
                  {roleDisplayName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {canViewAll 
                  ? 'Verwalten Sie Krankmeldungen, Atteste und Analysen zentral'
                  : canViewTeamOverview
                    ? 'Verwalten Sie Team-Krankmeldungen und Genehmigungen'
                    : 'Ihre persönlichen Krankmeldungen verwalten'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs - Underline Style */}
        <Tabs defaultValue={defaultTab} className="w-full space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {canViewAll && (
              <TabsTrigger 
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Übersicht
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="my-sick-leaves"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Meine Krankmeldungen
            </TabsTrigger>
            {canViewTeamOverview && (
              <TabsTrigger 
                value="team-overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Teamübersicht
              </TabsTrigger>
            )}
            {canViewLiveMonitor && (
              <TabsTrigger 
                value="approvals"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Genehmigungen & Workflows
              </TabsTrigger>
            )}
            {canViewStatistics && (
              <TabsTrigger 
                value="reports"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Analyse & Berichte
              </TabsTrigger>
            )}
            {canManageSettings && (
              <TabsTrigger 
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Einstellungen
              </TabsTrigger>
            )}
          </TabsList>

          {canViewAll && (
            <TabsContent value="overview" className="mt-6">
              <TeamSickLeaveOverview />
            </TabsContent>
          )}
          
          <TabsContent value="my-sick-leaves" className="mt-6">
            <MySickLeaves />
          </TabsContent>
          
          {canViewTeamOverview && (
            <TabsContent value="team-overview" className="mt-6">
              <TeamOverviewTab />
            </TabsContent>
          )}
          
          {canViewLiveMonitor && (
            <TabsContent value="approvals" className="mt-6">
              <SickLeaveLiveMonitor />
            </TabsContent>
          )}
          
          {canViewStatistics && (
            <TabsContent value="reports" className="mt-6">
              <SickLeaveStatistics />
            </TabsContent>
          )}

          {canManageSettings && (
            <TabsContent value="settings" className="mt-6">
              <SickLeaveSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ModernSickLeaveDashboard;
