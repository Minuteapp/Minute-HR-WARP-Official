
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bell, Settings as SettingsIcon, User } from "lucide-react";
import { useHelpdeskStats } from '@/hooks/useHelpdesk';
import { CreateTicketDialog } from './CreateTicketDialog';
import { HelpdeskSelfService } from './HelpdeskSelfService';
import { EnterpriseTicketsTable } from './EnterpriseTicketsTable';
import { MyRequestsTable } from './MyRequestsTable';
import { HelpdeskKnowledgeBaseTab } from './HelpdeskKnowledgeBaseTab';
import { HelpdeskStatisticsTab } from './HelpdeskStatisticsTab';
import { HelpdeskSettingsTab } from './HelpdeskSettingsTab';
import { HelpdeskAutomationsTab } from './HelpdeskAutomationsTab';
import { Skeleton } from "@/components/ui/skeleton";
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const HelpdeskDashboard = () => {
  const { data: stats, isLoading } = useHelpdeskStats();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { hasAction } = useEnterprisePermissions();
  
  // Rollenbasierte Berechtigung - nur Benutzer mit edit/delete/approve Rechten sehen Admin-Tabs
  const canManageTickets = hasAction('helpdesk', 'edit') || 
                           hasAction('helpdesk', 'delete') ||
                           hasAction('helpdesk', 'approve');

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

  const tabTriggerClass = "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-1 pb-3 pt-0 text-muted-foreground hover:text-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue={canManageTickets ? "posteingang" : "self-service"} className="w-full">
        <div className="p-6 space-y-6">
          {/* Header - Pulse Surveys Style */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                  <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold">HR Helpdesk</h1>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Anfragen, Wissensdatenbank und Self-Service-Funktionen
                </p>
              </div>
            </div>
          </div>

          {/* Tabs - Underline Style */}
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {canManageTickets && (
              <TabsTrigger 
                value="posteingang"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Posteingang
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="self-service"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Self-Service
            </TabsTrigger>
            <TabsTrigger 
              value="my-tickets"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Meine Anfragen
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
            >
              Wissensdatenbank
            </TabsTrigger>
            {canManageTickets && (
              <>
                <TabsTrigger 
                  value="automatisierungen"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Automatisierungen
                </TabsTrigger>
                <TabsTrigger 
                  value="statistik"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
                >
                  Statistik
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {canManageTickets && (
            <TabsContent value="posteingang" className="mt-6">
              <EnterpriseTicketsTable onCreateTicket={() => setIsCreateDialogOpen(true)} />
            </TabsContent>
          )}

          <TabsContent value="self-service" className="mt-6">
            <HelpdeskSelfService />
          </TabsContent>

          <TabsContent value="my-tickets" className="mt-6">
            <MyRequestsTable onCreateTicket={() => setIsCreateDialogOpen(true)} />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <HelpdeskKnowledgeBaseTab />
          </TabsContent>

          {canManageTickets && (
            <>
              <TabsContent value="automatisierungen" className="mt-6">
                <HelpdeskAutomationsTab />
              </TabsContent>

              <TabsContent value="statistik" className="mt-6">
                <HelpdeskStatisticsTab />
              </TabsContent>
            </>
          )}

          <CreateTicketDialog 
            open={isCreateDialogOpen} 
            onOpenChange={setIsCreateDialogOpen} 
          />
        </div>
      </Tabs>
    </div>
  );
};
