// Settings-Driven Architecture (SDA) - Compliance Dashboard
// Hauptseite für die Übersicht aller Settings und deren Compliance

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, CheckSquare, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { SettingsOverview } from '@/components/settings/SettingsOverview';
import { SettingsAuditLog } from '@/components/settings/SettingsAuditLog';
import { InheritanceTreeView } from '@/components/settings/InheritanceTreeView';
import { ModuleComplianceCard } from '@/components/settings/ModuleComplianceCard';

const SettingsComplianceDashboard = () => {
  return (
    <PageLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Settings Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Übersicht aller Einstellungen, Vererbungshierarchien und Änderungshistorie
          </p>
        </div>

        {/* Module Compliance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <ModuleComplianceCard 
            module="timetracking" 
            moduleName="Zeiterfassung" 
            icon={Clock}
            expectedSettings={['manual_booking_allowed', 'break_tracking_mode', 'approval_required', 'location_tracking_required', 'overtime_threshold_hours']}
          />
          <ModuleComplianceCard 
            module="absence" 
            moduleName="Abwesenheit" 
            icon={Calendar}
            expectedSettings={['self_request_allowed', 'min_advance_days', 'max_days_per_request', 'document_required_after_days', 'auto_approval_enabled']}
          />
          <ModuleComplianceCard 
            module="tasks" 
            moduleName="Aufgaben" 
            icon={CheckSquare}
            expectedSettings={['create_task_allowed', 'assignment_restriction', 'due_date_required', 'priority_required']}
          />
          <ModuleComplianceCard 
            module="dashboard" 
            moduleName="Dashboard" 
            icon={LayoutDashboard}
            expectedSettings={['show_timetracking_widget', 'show_tasks_widget', 'show_absence_widget', 'show_team_widget']}
          />
          <ModuleComplianceCard 
            module="ai" 
            moduleName="KI-Funktionen" 
            icon={Sparkles}
            expectedSettings={['ai_suggestions_enabled', 'chatbot_enabled', 'document_analysis_enabled']}
          />
        </div>

        {/* Tabs für Details */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Einstellungsübersicht</TabsTrigger>
            <TabsTrigger value="inheritance">Vererbungshierarchie</TabsTrigger>
            <TabsTrigger value="audit">Änderungshistorie</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SettingsOverview />
          </TabsContent>

          <TabsContent value="inheritance">
            <InheritanceTreeView />
          </TabsContent>

          <TabsContent value="audit">
            <SettingsAuditLog limit={100} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsComplianceDashboard;
