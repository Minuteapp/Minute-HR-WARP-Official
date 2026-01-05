import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, ClipboardList, BarChart3, Target, FileText, Leaf } from 'lucide-react';
import { ESGDashboardTab } from './dashboard/ESGDashboardTab';
import { DataCollectionTab } from './data-collection/DataCollectionTab';
import { AnalyticsTab } from './analytics/AnalyticsTab';
import { MeasuresTab } from './measures/MeasuresTab';
import { EUReportingTab } from './reporting/EUReportingTab';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';

export const ESGManagementDashboard = () => {
  const { hasAction } = useEnterprisePermissions();
  
  // Berechtigungen basierend auf Rolle
  const canViewDashboard = true; // Alle können Dashboard sehen
  const canViewDataCollection = hasAction('environment', 'update') || hasAction('environment', 'approve');
  const canViewAnalytics = hasAction('environment', 'read') || hasAction('environment', 'update');
  const canViewMeasures = hasAction('environment', 'update') || hasAction('environment', 'approve');
  const canViewReporting = hasAction('environment', 'export') || hasAction('environment', 'approve');

  const getDefaultTab = () => {
    if (canViewDashboard) return 'dashboard';
    if (canViewAnalytics) return 'analytics';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  useEffect(() => {
    const tabPermissions: Record<string, boolean> = {
      'dashboard': canViewDashboard,
      'data-collection': canViewDataCollection,
      'analytics': canViewAnalytics,
      'measures': canViewMeasures,
      'reporting': canViewReporting,
    };
    
    if (!tabPermissions[activeTab]) {
      setActiveTab(getDefaultTab());
    }
  }, [canViewDashboard, canViewDataCollection, canViewAnalytics, canViewMeasures, canViewReporting, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">ESG & Nachhaltigkeit</h1>
              <p className="text-sm text-muted-foreground">Umwelt, Soziales und Unternehmensführung</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {canViewDashboard && (
              <TabsTrigger 
                value="dashboard"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            )}
            {canViewDataCollection && (
              <TabsTrigger 
                value="data-collection"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Datenerfassung
              </TabsTrigger>
            )}
            {canViewAnalytics && (
              <TabsTrigger 
                value="analytics"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analysen
              </TabsTrigger>
            )}
            {canViewMeasures && (
              <TabsTrigger 
                value="measures"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Maßnahmen
              </TabsTrigger>
            )}
            {canViewReporting && (
              <TabsTrigger 
                value="reporting"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                EU-Reporting
              </TabsTrigger>
            )}
          </TabsList>

          {canViewDashboard && (
            <TabsContent value="dashboard" className="mt-6">
              <ESGDashboardTab />
            </TabsContent>
          )}

          {canViewDataCollection && (
            <TabsContent value="data-collection" className="mt-6">
              <DataCollectionTab />
            </TabsContent>
          )}

          {canViewAnalytics && (
            <TabsContent value="analytics" className="mt-6">
              <AnalyticsTab />
            </TabsContent>
          )}

          {canViewMeasures && (
            <TabsContent value="measures" className="mt-6">
              <MeasuresTab />
            </TabsContent>
          )}

          {canViewReporting && (
            <TabsContent value="reporting" className="mt-6">
              <EUReportingTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};