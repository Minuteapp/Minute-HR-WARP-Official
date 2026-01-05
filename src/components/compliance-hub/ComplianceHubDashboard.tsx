// Compliance Hub - Haupt-Dashboard mit 8 Tabs
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, FileText, AlertTriangle, Clock, Shield, GraduationCap, Leaf, ClipboardCheck, Settings } from 'lucide-react';
import { ComplianceDashboardTab } from './dashboard/ComplianceDashboardTab';
import { PoliciesTab } from './policies/PoliciesTab';
import { RisksViolationsTab } from './risks/RisksViolationsTab';
import { WorkingTimeTab } from './working-time/WorkingTimeTab';
import { DataProtectionTab } from './data-protection/DataProtectionTab';
import { TrainingTab } from './training/TrainingTab';
import { ESGComplianceTab } from './esg/ESGComplianceTab';
import { AuditsTab } from './audits/AuditsTab';
import { SettingsTab } from './settings/SettingsTab';
import { usePermissionContext } from '@/contexts/PermissionContext';

export const ComplianceHubDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { hasPermission } = usePermissionContext();

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredAction: 'view' },
    { id: 'policies', label: 'Richtlinien & Policies', icon: FileText, requiredAction: 'view' },
    { id: 'risks', label: 'Risiken & Verstöße', icon: AlertTriangle, requiredAction: 'view' },
    { id: 'working-time', label: 'Arbeitszeit & Arbeitsrecht', icon: Clock, requiredAction: 'view' },
    { id: 'data-protection', label: 'Datenschutz & DSGVO', icon: Shield, requiredAction: 'view' },
    { id: 'training', label: 'Schulungen & Pflichtunterweisungen', icon: GraduationCap, requiredAction: 'view' },
    { id: 'esg', label: 'ESG & Social Compliance', icon: Leaf, requiredAction: 'view' },
    { id: 'audits', label: 'Audits & Prüfungen', icon: ClipboardCheck, requiredAction: 'export', adminOnly: true },
    { id: 'settings', label: 'Einstellungen', icon: Settings, requiredAction: 'update', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('compliance', 'update');
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('compliance', tab.requiredAction);
    });
  }, [hasPermission]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Compliance Hub</h1>
              <p className="text-sm text-muted-foreground">Zentrale Compliance-Übersicht und -Verwaltung</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6 overflow-x-auto">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><ComplianceDashboardTab /></TabsContent>
          <TabsContent value="policies" className="mt-6"><PoliciesTab /></TabsContent>
          <TabsContent value="risks" className="mt-6"><RisksViolationsTab /></TabsContent>
          <TabsContent value="working-time" className="mt-6"><WorkingTimeTab /></TabsContent>
          <TabsContent value="data-protection" className="mt-6"><DataProtectionTab /></TabsContent>
          <TabsContent value="training" className="mt-6"><TrainingTab /></TabsContent>
          <TabsContent value="esg" className="mt-6"><ESGComplianceTab /></TabsContent>
          <TabsContent value="audits" className="mt-6"><AuditsTab /></TabsContent>
          <TabsContent value="settings" className="mt-6"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
