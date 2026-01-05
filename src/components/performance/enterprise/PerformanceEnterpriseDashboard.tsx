import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Building2, Layers, Users, User, Target, MessageSquare, GraduationCap, Sparkles, History, Settings } from "lucide-react";
import { usePermissionContext } from '@/contexts/PermissionContext';
import { OverviewTab } from "./tabs/OverviewTab";
import { CompanyTab } from "./tabs/CompanyTab";
import { DepartmentsTab } from "./tabs/DepartmentsTab";
import { TeamsTab } from "./tabs/TeamsTab";
import { EmployeesTab } from "./tabs/EmployeesTab";
import { GoalsTab } from "./tabs/GoalsTab";
import { FeedbackTab } from "./tabs/FeedbackTab";
import { DevelopmentTab } from "./tabs/DevelopmentTab";
import { AIInsightsTab } from "./tabs/AIInsightsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { SettingsTab } from "./tabs/SettingsTab";

export function PerformanceEnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { hasPermission } = usePermissionContext();

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'overview', label: 'Übersicht', icon: LayoutDashboard, requiredAction: 'view' },
    { id: 'company', label: 'Unternehmen', icon: Building2, requiredAction: 'view', adminOnly: true },
    { id: 'departments', label: 'Abteilungen', icon: Layers, requiredAction: 'view', adminOnly: true },
    { id: 'teams', label: 'Teams', icon: Users, requiredAction: 'view' },
    { id: 'employees', label: 'Mitarbeiter', icon: User, requiredAction: 'view' },
    { id: 'goals', label: 'Ziele', icon: Target, requiredAction: 'view' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, requiredAction: 'view' },
    { id: 'development', label: 'Entwicklung', icon: GraduationCap, requiredAction: 'view' },
    { id: 'ai-insights', label: 'KI-Insights', icon: Sparkles, requiredAction: 'view' },
    { id: 'history', label: 'Historie', icon: History, requiredAction: 'view' },
    { id: 'settings', label: 'Einstellungen', icon: Settings, requiredAction: 'update', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('performance', 'update');
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('performance', tab.requiredAction);
    });
  }, [hasPermission]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Performance Management</h1>
              <p className="text-sm text-muted-foreground">Leistungssteuerung, Feedback & Entwicklung mit KI-Unterstützung</p>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-center gap-6 border-b bg-transparent h-auto p-0 overflow-x-auto w-full justify-start rounded-none">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
        <TabsContent value="company" className="mt-6"><CompanyTab /></TabsContent>
        <TabsContent value="departments" className="mt-6"><DepartmentsTab /></TabsContent>
        <TabsContent value="teams" className="mt-6"><TeamsTab /></TabsContent>
        <TabsContent value="employees" className="mt-6"><EmployeesTab /></TabsContent>
        <TabsContent value="goals" className="mt-6"><GoalsTab /></TabsContent>
        <TabsContent value="feedback" className="mt-6"><FeedbackTab /></TabsContent>
        <TabsContent value="development" className="mt-6"><DevelopmentTab /></TabsContent>
        <TabsContent value="ai-insights" className="mt-6"><AIInsightsTab /></TabsContent>
        <TabsContent value="history" className="mt-6"><HistoryTab /></TabsContent>
        <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
