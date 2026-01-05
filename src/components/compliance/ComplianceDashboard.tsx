import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Calendar,
  TrendingUp,
  Plus,
  BarChart3,
  Loader2
} from "lucide-react";
import { useComplianceStats } from '@/hooks/useCompliance';
import { ComplianceCasesList } from './ComplianceCasesList';
import { CompliancePoliciesList } from './CompliancePoliciesList';
import { ComplianceAuditsList } from './ComplianceAuditsList';
import { ComplianceIncidentsList } from './ComplianceIncidentsList';
import { ComplianceRiskMatrix } from './ComplianceRiskMatrix';
import { ComplianceReporting } from './ComplianceReporting';
import { WhistleblowerSystem } from './WhistleblowerSystem';
import { ComplianceDeadlines } from './ComplianceDeadlines';
import { Skeleton } from "@/components/ui/skeleton";
import { useModuleGates } from '@/hooks/useModuleGates';
import { ModuleNotConfigured } from '@/components/ui/module-not-configured';

export const ComplianceDashboard = () => {
  // ZERO-DATA-START: Prüfe ob Modul konfiguriert ist
  const { isReady, isLoading: gatesLoading, missingRequirements, settingsPath, moduleName, moduleDescription } = useModuleGates('compliance');
  
  const { data: stats, isLoading } = useComplianceStats();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Compliance Hub</h1>
              <p className="text-sm text-muted-foreground">Zentrale Verwaltung für Compliance und Risikomanagement</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Berichte
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Fall
            </Button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance-Fälle</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCases || 0}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant="destructive" className="text-xs">
                  {stats?.criticalCases || 0} kritisch
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats?.openCases || 0} offen
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audits</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAudits || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeAudits || 0} laufend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vorfälle</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalIncidents || 0}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant="destructive" className="text-xs">
                  {stats?.criticalIncidents || 0} kritisch
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats?.openIncidents || 0} in Bearbeitung
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risiken</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRisks || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.highRisks || 0} hohes Risiko
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            <TabsTrigger 
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="cases"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Fälle
            </TabsTrigger>
            <TabsTrigger 
              value="policies"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Richtlinien
            </TabsTrigger>
            <TabsTrigger 
              value="audits"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Audits
            </TabsTrigger>
            <TabsTrigger 
              value="incidents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Vorfälle
            </TabsTrigger>
            <TabsTrigger 
              value="whistleblower"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Whistleblower
            </TabsTrigger>
            <TabsTrigger 
              value="risks"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Risiken
            </TabsTrigger>
            <TabsTrigger 
              value="reporting"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Reporting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Anstehende Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplianceDeadlines limit={5} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Aktuelle Vorfälle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplianceIncidentsList limit={5} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Risiko-Matrix</CardTitle>
                <CardDescription>
                  Übersicht über alle identifizierten Risiken nach Eintrittswahrscheinlichkeit und Auswirkung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceRiskMatrix />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <ComplianceCasesList />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <CompliancePoliciesList />
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            <ComplianceAuditsList />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <ComplianceIncidentsList />
          </TabsContent>

          <TabsContent value="whistleblower" className="space-y-6">
            <WhistleblowerSystem />
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <ComplianceRiskMatrix detailed />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <ComplianceReporting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};