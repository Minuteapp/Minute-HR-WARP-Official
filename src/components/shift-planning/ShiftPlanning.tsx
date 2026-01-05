import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Brain, 
  Clock, 
  UserPlus, 
  BarChart3, 
  Settings,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { CalendarView } from './CalendarView';
import { ScalableShiftView } from './ScalableShiftView';
import { SkillsManagement } from './SkillsManagement';
import { ShiftTypesManagement } from './ShiftTypesManagement';
import { AssignmentAutomation } from './AssignmentAutomation';
import { LiveMonitor } from './LiveMonitor';
import { AbsenceManagement } from './AbsenceManagement';
import { HeatmapView } from './HeatmapView';
import AIAssistant from './AIAssistant';
import { ReportsAnalytics } from './ReportsAnalytics';
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';

const ShiftPlanning = () => {
  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('shift-planning');
  const { hasPermission } = usePermissionContext();

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'scalable', label: 'Planung', icon: Calendar, requiredAction: 'view' },
    { id: 'assignment', label: 'Mitarbeiter', icon: UserPlus, requiredAction: 'view' },
    { id: 'monitor', label: 'Analyse', icon: BarChart3, requiredAction: 'view' },
    { id: 'ai-assistant', label: 'KI-Assistent', icon: Brain, requiredAction: 'view' },
    { id: 'shift-types', label: 'Einstellungen', icon: Clock, requiredAction: 'update', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('shift_planning', 'update');
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('shift_planning', tab.requiredAction);
    });
  }, [hasPermission]);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Schichtplanung</h1>
              <p className="text-sm text-muted-foreground">Planen und verwalten Sie Schichten effizient</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Hilfe
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scalable" className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="scalable" className="mt-6">
            <ScalableShiftView />
          </TabsContent>
          
          <TabsContent value="assignment" className="mt-6">
            <AssignmentAutomation />
          </TabsContent>
          
          <TabsContent value="monitor" className="mt-6">
            <LiveMonitor />
          </TabsContent>
          
          <TabsContent value="ai-assistant" className="mt-6">
            <AIAssistant />
          </TabsContent>
          
          <TabsContent value="shift-types" className="mt-6">
            <ShiftTypesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShiftPlanning;