import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Brain,
  Sparkles,
  Search,
  Bell,
  Settings,
  User,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { absenceService } from '@/services/absenceService';
import { AbsenceQuickActions } from './AbsenceQuickActions';
import { AbsenceAIPanel } from './AbsenceAIPanel';
import { AbsenceCompliancePanel } from './AbsenceCompliancePanel';
import { TeamOverviewView } from './team/TeamOverviewView';
import { ApprovalsView } from './approvals/ApprovalsView';
import { ReportsView } from './reports/ReportsView';
import { AbsenceCalendarView } from './AbsenceCalendarView';
import { AbsenceDataProvider } from '../enterprise/AbsenceDataProvider';
import { AbsenceFilters } from '../enterprise/AbsenceFilters';
import { AbsenceBulkActions } from '../enterprise/AbsenceBulkActions';
import { AbsencePaginatedList } from '../enterprise/AbsencePaginatedList';
import { AbsenceAnalyticsDashboard } from '../enterprise/AbsenceAnalyticsDashboard';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { AbsenceLocationDepartmentFilters } from './AbsenceLocationDepartmentFilters';
import { AbsenceCompactList } from './AbsenceCompactList';
import { AbsenceTypesChart } from './AbsenceTypesChart';
import { AbsenceQuickActionsFooter } from './AbsenceQuickActionsFooter';
import { MyAbsencesView } from './MyAbsencesView';
import { AbsenceRequestDialog } from './AbsenceRequestDialog';
import { teamAbsenceService } from '@/services/teamAbsenceService';
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';

export const ModernAbsenceDashboard: React.FC = () => {
  // ALLE HOOKS MÜSSEN VOR JEDEM CONDITIONAL RETURN STEHEN!
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('absence');
  
  // Rollenbasierte Berechtigungen
  const { canApproveRequests, canViewAllRequests, canManageSettings } = useAbsenceManagement();
  
  // Standard-Tab basierend auf Berechtigungen: Mitarbeiter -> "my-absences", Admin/Manager -> "overview"
  const defaultTab = (canViewAllRequests || canApproveRequests) ? 'overview' : 'my-absences';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: recentRequests = [], isLoading } = useQuery({
    queryKey: ['recent-absence-requests'],
    queryFn: absenceService.getRequests
  });

  // Statistiken aus DB laden (nur für Admin/Manager)
  const { data: stats } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: () => teamAbsenceService.getTeamStatistics(),
    enabled: canViewAllRequests || canApproveRequests
  });

  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist - NACH allen Hooks!
  if (gatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isReady) {
    return (
      <ModuleNotConfigured
        moduleName={moduleName}
        requiredSettings={missingRequirements}
        settingsPath={settingsPath}
        description={moduleDescription}
      />
    );
  }

  const absenceStats = {
    pending: recentRequests.filter((r: any) => r.status === 'pending').length,
    approved: recentRequests.filter((r: any) => r.status === 'approved').length,
    teamAbsenceRate: 0,
    complianceScore: 0
  };

  const upcomingAbsences = recentRequests
    .filter((r: any) => new Date(r.start_date) > new Date())
    .slice(0, 10)
    .map((r: any) => ({
      ...r,
      duration: Math.ceil((new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / (1000 * 60 * 60 * 24))
    }));

  const currentAbsences = recentRequests.filter((r: any) => 
    new Date(r.start_date) <= new Date() && new Date(r.end_date) >= new Date()
  );

  const quickStats = [
    {
      title: 'Aktuelle Abwesenheiten',
      value: stats?.currentAbsences?.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+5 vs. letzte Woche',
      trendLabel: '10. bis 16. Woche',
      trendPositive: false
    },
    {
      title: 'Durchschnittlicher Resturlaub',
      value: stats?.avgRemainingVacation?.toString() || '0',
      suffix: ' Tage',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '-2 Tage vs. letzter Monat',
      trendLabel: '',
      trendPositive: false
    },
    {
      title: 'Abwesenheitsquote',
      value: stats?.absenceRate || '0',
      suffix: '%',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+1.2% vs. Vormonat',
      trendLabel: '',
      trendPositive: false
    },
    {
      title: 'Offene Genehmigungen',
      value: stats?.pendingRequests?.toString() || '0',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: '⌀ 2.3 Tage Wartezeit',
      trendLabel: '',
      trendPositive: true
    }
  ];

  return (
    <AbsenceDataProvider>
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Abwesenheit</h1>
              <p className="text-sm text-muted-foreground">Verwalten Sie Urlaub, Krankmeldungen und andere Abwesenheitsarten</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">

            {/* Mitarbeiter sieht NUR "Meine Abwesenheiten" */}
            {!canViewAllRequests && !canApproveRequests && (
              <TabsTrigger 
                value="my-absences" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Meine Abwesenheiten
              </TabsTrigger>
            )}
            
            {/* Admin/Manager sehen alle Tabs */}
            {(canViewAllRequests || canApproveRequests) && (
              <>
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Übersicht
                </TabsTrigger>
                <TabsTrigger 
                  value="my-absences" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Meine Abwesenheiten
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Team-Übersicht
                </TabsTrigger>
                {canViewAllRequests && (
                  <>
                    <TabsTrigger 
                      value="approvals" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Genehmigungen
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reports" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Berichte
                    </TabsTrigger>
                    <TabsTrigger 
                      value="calendar" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                    >
                      Kalender
                    </TabsTrigger>
                  </>
                )}
              </>
            )}
          </TabsList>

          {/* Content */}
          <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Overview nur für Admin/Manager */}
          {(canApproveRequests || canViewAllRequests) ? (
            <>
              {/* Location & Department Filters */}
              <AbsenceLocationDepartmentFilters />
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                {/* Left Column: Compact List */}
                <AbsenceCompactList absences={currentAbsences} isLoading={isLoading} />
                
                {/* Right Column: Chart & AI Panel */}
                <div className="space-y-6">
                  <AbsenceTypesChart absences={currentAbsences} />
                  
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        KI-Analyse
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AbsenceAIPanel />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Quick Actions Footer */}
              <AbsenceQuickActionsFooter onCalendarClick={() => setActiveTab('calendar')} />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Sie haben keine Berechtigung, diese Ansicht zu sehen.
            </div>
          )}
        </TabsContent>

          <TabsContent value="my-absences" className="mt-6 space-y-6">
            <MyAbsencesView />
          </TabsContent>

          <TabsContent value="approvals" className="mt-6 space-y-6">
            <ApprovalsView />
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <ReportsView />
          </TabsContent>

          <TabsContent value="team" className="mt-6 space-y-6">
            <TeamOverviewView />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6 space-y-6">
            <AbsenceCalendarView />
          </TabsContent>
        </Tabs>

        {/* Request Dialog */}
        <AbsenceRequestDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} />
      </div>
    </div>
    </AbsenceDataProvider>
  );
};