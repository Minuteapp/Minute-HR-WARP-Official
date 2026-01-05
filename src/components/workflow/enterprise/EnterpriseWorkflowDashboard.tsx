import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Wrench, Sparkles, BookOpen, Activity, Settings } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { BuilderTab } from './tabs/BuilderTab';
import { AIGeneratorTab } from './tabs/AIGeneratorTab';
import { LibraryTab } from './tabs/LibraryTab';
import { MonitoringTab } from './tabs/MonitoringTab';
import { SettingsTab } from './tabs/SettingsTab';

export const EnterpriseWorkflowDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header - Pulse Surveys Style */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Workflows & Automatisierungen</h1>
              <p className="text-sm text-muted-foreground">
                Intelligente Prozessautomatisierung für alle HR-Module
              </p>
            </div>
          </div>
        </div>

        {/* Tabs - Underline Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="builder" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Workflow-Builder
            </TabsTrigger>
            <TabsTrigger 
              value="ai-generator" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              KI-Generator
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Bibliothek
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Logs & Monitoring
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab onCreateNew={() => setActiveTab('builder')} />
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <BuilderTab />
          </TabsContent>

          <TabsContent value="ai-generator" className="mt-6">
            <AIGeneratorTab />
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            <LibraryTab />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <MonitoringTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
