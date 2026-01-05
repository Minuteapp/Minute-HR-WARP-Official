import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Globe, FileText, BarChart3, Archive } from "lucide-react";
import { useGlobalMobilityRequests } from '@/hooks/useGlobalMobility';
import { GlobalMobilityRequestsList } from './GlobalMobilityRequestsList';
import { CreateMobilityRequestDialog } from './CreateMobilityRequestDialog';
import { ExecutiveOverviewTab } from './tabs/ExecutiveOverviewTab';
import { EmployeesTab } from './tabs/EmployeesTab';
import { CostsTab } from './tabs/CostsTab';
import { RisksTab } from './tabs/RisksTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { RelocationTab } from './tabs/RelocationTab';
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useGlobalMobilityPermissions } from '@/hooks/useGlobalMobilityPermissions';

export const GlobalMobilityDashboard = () => {
  const { data: requests, isLoading } = useGlobalMobilityRequests();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const permissions = useGlobalMobilityPermissions();

  // Bestimme Default-Tab basierend auf Berechtigungen
  const getDefaultTab = () => {
    if (permissions.canViewExecutive) return 'executive';
    if (permissions.canViewCases) return 'cases';
    if (permissions.canViewVisa) return 'visa';
    return 'cases';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Wechsle Tab wenn aktueller nicht mehr sichtbar
  useEffect(() => {
    const tabPermissions: Record<string, boolean> = {
      'executive': permissions.canViewExecutive,
      'cases': permissions.canViewCases,
      'employees': permissions.canViewEmployees,
      'visa': permissions.canViewVisa,
      'relocation': permissions.canViewRelocation,
      'costs': permissions.canViewCosts,
      'risks': permissions.canViewRisks,
      'documents': permissions.canViewDocuments,
      'reports': permissions.canViewReports,
      'archive': permissions.canViewArchive,
    };
    
    if (!tabPermissions[activeTab]) {
      setActiveTab(getDefaultTab());
    }
  }, [permissions, activeTab]);

  const activeRequestsCount = requests?.filter(r => r.status === 'in_progress' || r.status === 'submitted' || r.status === 'under_review').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
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
    <div className="p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Globe className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Global Mobility</h1>
            <p className="text-sm text-muted-foreground">Internationale Entsendungen & Mobilität verwalten</p>
          </div>
          {activeRequestsCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeRequestsCount} aktiv
            </Badge>
          )}
        </div>
        {permissions.canCreateCase && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Neuen Fall erstellen
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-4 overflow-x-auto">
          {permissions.canViewExecutive && (
            <TabsTrigger value="executive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Executive Übersicht
            </TabsTrigger>
          )}
          {permissions.canViewCases && (
            <TabsTrigger value="cases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Entsendungen & Fälle
            </TabsTrigger>
          )}
          {permissions.canViewEmployees && (
            <TabsTrigger value="employees" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Mitarbeiter & Familienstatus
            </TabsTrigger>
          )}
          {permissions.canViewVisa && (
            <TabsTrigger value="visa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Visa, Steuern & Compliance
            </TabsTrigger>
          )}
          {permissions.canViewRelocation && (
            <TabsTrigger value="relocation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Relocation & Logistik
            </TabsTrigger>
          )}
          {permissions.canViewCosts && (
            <TabsTrigger value="costs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Kosten & Budgets
            </TabsTrigger>
          )}
          {permissions.canViewRisks && (
            <TabsTrigger value="risks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Risiken & Fristen
            </TabsTrigger>
          )}
          {permissions.canViewDocuments && (
            <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Dokumente
            </TabsTrigger>
          )}
          {permissions.canViewReports && (
            <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Reports & Analytics
            </TabsTrigger>
          )}
          {permissions.canViewArchive && (
            <TabsTrigger value="archive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 whitespace-nowrap">
              Archiv
            </TabsTrigger>
          )}
        </TabsList>

        {permissions.canViewExecutive && (
          <TabsContent value="executive" className="mt-6">
            <ExecutiveOverviewTab requests={requests || []} />
          </TabsContent>
        )}

        {permissions.canViewCases && (
          <TabsContent value="cases" className="mt-6">
            <GlobalMobilityRequestsList requests={requests || []} />
          </TabsContent>
        )}

        {permissions.canViewEmployees && (
          <TabsContent value="employees" className="mt-6">
            <EmployeesTab requests={requests || []} />
          </TabsContent>
        )}

        {permissions.canViewVisa && (
          <TabsContent value="visa" className="mt-6">
            <ComplianceTab requests={requests || []} />
          </TabsContent>
        )}

        {permissions.canViewRelocation && (
          <TabsContent value="relocation" className="mt-6">
            <RelocationTab requests={requests || []} />
          </TabsContent>
        )}

        {permissions.canViewCosts && (
          <TabsContent value="costs" className="mt-6">
            <CostsTab />
          </TabsContent>
        )}

        {permissions.canViewRisks && (
          <TabsContent value="risks" className="mt-6">
            <RisksTab />
          </TabsContent>
        )}

        {permissions.canViewDocuments && (
          <TabsContent value="documents" className="mt-6">
            <EmptyState
              icon={FileText}
              title="Dokumentenverwaltung"
              description="Verwalten Sie alle Dokumente für Ihre internationalen Entsendungen zentral an einem Ort."
              actionLabel="Dokument hochladen"
              onAction={() => {}}
              size="lg"
            />
          </TabsContent>
        )}

        {permissions.canViewReports && (
          <TabsContent value="reports" className="mt-6">
            <EmptyState
              icon={BarChart3}
              title="Reports & Analytics"
              description="Detaillierte Berichte und Analysen zu allen Global Mobility Aktivitäten werden hier angezeigt."
              actionLabel="Report erstellen"
              onAction={() => {}}
              size="lg"
            />
          </TabsContent>
        )}

        {permissions.canViewArchive && (
          <TabsContent value="archive" className="mt-6">
            <EmptyState
              icon={Archive}
              title="Archiv"
              description="Abgeschlossene und archivierte Entsendungsfälle finden Sie hier zur Referenz und Dokumentation."
              size="lg"
            />
          </TabsContent>
        )}
      </Tabs>

      <CreateMobilityRequestDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
