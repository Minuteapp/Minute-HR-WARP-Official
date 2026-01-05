import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OverviewTab } from './tabs/OverviewTab';
import { BudgetPlanningTab } from './tabs/BudgetPlanningTab';
import { ForecastScenariosTab } from './tabs/ForecastScenariosTab';
import { CostCentersTab } from './tabs/CostCentersTab';
import { DeviationsTab } from './tabs/DeviationsTab';
import { ConnectionsTab } from './tabs/ConnectionsTab';
import { AIInsightsTab } from './tabs/AIInsightsTab';
import { ArchiveTab } from './tabs/ArchiveTab';
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';
import { usePermissionContext } from '@/contexts/PermissionContext';

export const BudgetForecastDashboard = () => {
  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('budget');
  const { hasPermission } = usePermissionContext();

  const [fiscalYear, setFiscalYear] = useState('2025');
  const [activeTab, setActiveTab] = useState('overview');

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'overview', label: 'Übersicht', requiredAction: 'view' },
    { id: 'planning', label: 'Budgetplanung', requiredAction: 'update', adminOnly: true },
    { id: 'forecast', label: 'Forecast & Szenarien', requiredAction: 'update', adminOnly: true },
    { id: 'cost-centers', label: 'Kostenstellen', requiredAction: 'update', adminOnly: true },
    { id: 'deviations', label: 'Abweichungen', requiredAction: 'view', teamLeadAllowed: true },
    { id: 'connections', label: 'Verknüpfungen', requiredAction: 'update', adminOnly: true },
    { id: 'ai-insights', label: 'KI-Insights', requiredAction: 'update', adminOnly: true },
    { id: 'archive', label: 'Archiv', requiredAction: 'update', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('budget', 'update');
    const canView = hasPermission('budget', 'view');
    
    return allTabs.filter(tab => {
      // Admin-only Tabs nur für Admins/HR
      if (tab.adminOnly && !canAdmin) return false;
      // Teamleiter-erlaubte Tabs
      if (tab.teamLeadAllowed && !canAdmin && !canView) return false;
      // Standard-Tabs nur wenn view-Berechtigung
      return hasPermission('budget', tab.requiredAction);
    });
  }, [hasPermission]);

  // Setze aktiven Tab auf ersten verfügbaren wenn aktueller nicht sichtbar
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

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

  const fiscalYears = ['2023', '2024', '2025', '2026'];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Budget & Forecast</h1>
              <p className="text-sm text-muted-foreground">Financial Planning & Management Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Geschäftsjahr</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[100px]">
                    {fiscalYear}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {fiscalYears.map((year) => (
                    <DropdownMenuItem key={year} onClick={() => setFiscalYear(year)}>
                      {year}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Tabs - Nur sichtbare Tabs anzeigen */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 space-x-6 flex-wrap">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab fiscalYear={fiscalYear} />
          </TabsContent>
          <TabsContent value="planning" className="mt-6">
            <BudgetPlanningTab fiscalYear={fiscalYear} />
          </TabsContent>
          <TabsContent value="forecast" className="mt-6">
            <ForecastScenariosTab />
          </TabsContent>
          <TabsContent value="cost-centers" className="mt-6">
            <CostCentersTab />
          </TabsContent>
          <TabsContent value="deviations" className="mt-6">
            <DeviationsTab />
          </TabsContent>
          <TabsContent value="connections" className="mt-6">
            <ConnectionsTab />
          </TabsContent>
          <TabsContent value="ai-insights" className="mt-6">
            <AIInsightsTab />
          </TabsContent>
          <TabsContent value="archive" className="mt-6">
            <ArchiveTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
