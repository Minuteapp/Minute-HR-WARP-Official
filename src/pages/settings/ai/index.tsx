import { useState, useEffect } from "react";
import { ChevronLeft, BrainCircuit, Zap, TrendingUp, Users, Target, Shield, Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import { AIModuleToggle } from "@/components/settings/ai/AIModuleToggle";
import { WorkflowSettings } from "@/components/settings/ai/WorkflowSettings";
import { ThresholdSettings } from "@/components/settings/ai/ThresholdSettings";
import { NotificationSettings } from "@/components/settings/ai/NotificationSettings";
import { DataPolicySettings } from "@/components/settings/ai/DataPolicySettings";
import { AIAuditLog } from "@/components/settings/ai/AIAuditLog";
import { EmptyState } from "@/components/ui/empty-state";

export default function AISettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // CLEAN INITIALIZATION: Echte Daten aus der Datenbank laden
  const { data: aiModulesData = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['ai-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching AI modules:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const { data: workflowsData = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['ai-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching workflows:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const { data: auditLogsData = [], isLoading: logsLoading } = useQuery({
    queryKey: ['ai-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // State für lokale Änderungen
  const [aiModules, setAiModules] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [thresholdRules, setThresholdRules] = useState<any[]>([]);
  const [notificationRules, setNotificationRules] = useState<any[]>([]);
  const [dataPolicies, setDataPolicies] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Sync echte Daten mit lokalen State
  useEffect(() => {
    if (aiModulesData.length > 0) {
      setAiModules(aiModulesData.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        category: m.category as 'hr' | 'finance' | 'security' | 'analytics',
        enabled: m.is_active,
        icon: getCategoryIcon(m.category)
      })));
    }
  }, [aiModulesData]);

  useEffect(() => {
    if (workflowsData.length > 0) {
      setWorkflows(workflowsData.map(w => ({
        id: w.id,
        name: w.workflow_name,
        description: w.module_name,
        triggerEvent: w.action_key,
        actions: [],
        enabled: w.is_active,
        approvalRequired: true,
        executionCount: 0,
        lastExecuted: null
      })));
    }
  }, [workflowsData]);

  useEffect(() => {
    if (auditLogsData.length > 0) {
      setAuditLogs(auditLogsData.map(log => ({
        id: log.id,
        timestamp: log.usage_date,
        userId: log.user_id,
        userName: log.employee_name || 'Unbekannt',
        action: 'ai_usage',
        module: log.module_used,
        details: log.task_description,
        ipAddress: '',
        userAgent: '',
        success: log.success
      })));
    }
  }, [auditLogsData]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return Users;
      case 'finance': return TrendingUp;
      case 'security': return Shield;
      case 'analytics': return Bot;
      default: return BrainCircuit;
    }
  };

  const handleModuleToggle = async (moduleId: string, enabled: boolean) => {
    setAiModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, enabled } : module
    ));
    
    // Update in DB
    await supabase
      .from('ai_models')
      .update({ is_active: enabled })
      .eq('id', moduleId);
    
    toast({
      title: enabled ? "Modul aktiviert" : "Modul deaktiviert",
      description: `Das KI-Modul wurde erfolgreich ${enabled ? 'aktiviert' : 'deaktiviert'}.`
    });
  };

  const handleWorkflowToggle = async (workflowId: string, enabled: boolean) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId ? { ...workflow, enabled } : workflow
    ));
    
    await supabase
      .from('approval_workflows')
      .update({ is_active: enabled })
      .eq('id', workflowId);
    
    toast({
      title: enabled ? "Workflow aktiviert" : "Workflow deaktiviert",
      description: `Der Workflow wurde erfolgreich ${enabled ? 'aktiviert' : 'deaktiviert'}.`
    });
  };

  const handleWorkflowEdit = (workflowId: string) => {
    toast({
      title: "Workflow bearbeiten",
      description: "Workflow-Editor wird geöffnet..."
    });
  };

  const handleWorkflowDelete = async (workflowId: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
    
    await supabase
      .from('approval_workflows')
      .delete()
      .eq('id', workflowId);
    
    toast({
      title: "Workflow gelöscht",
      description: "Der Workflow wurde erfolgreich gelöscht."
    });
  };

  const handleCreateWorkflow = () => {
    toast({
      title: "Workflow erstellen",
      description: "Workflow-Designer wird geöffnet..."
    });
  };

  const handleUpdateThresholdRule = (ruleId: string, updates: any) => {
    setThresholdRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleAddThresholdRule = (rule: any) => {
    const newRule = { ...rule, id: `rule-${Date.now()}` };
    setThresholdRules(prev => [...prev, newRule]);
    toast({
      title: "Schwellenwert hinzugefügt",
      description: "Der neue Schwellenwert wurde erfolgreich erstellt."
    });
  };

  const handleUpdateNotificationRule = (ruleId: string, updates: any) => {
    setNotificationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleUpdateDataPolicy = (policyId: string, updates: any) => {
    setDataPolicies(prev => prev.map(policy => 
      policy.id === policyId ? { ...policy, ...updates } : policy
    ));
  };

  const handleExportAuditLog = () => {
    toast({
      title: "Export gestartet",
      description: "Das Aktivitätsprotokoll wird exportiert..."
    });
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">KI & Automatisierung</h1>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Module
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Schwellenwerte
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="data-policy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Datenschutz
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Protokoll
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          {modulesLoading ? (
            <p className="text-muted-foreground">Lade Module...</p>
          ) : aiModules.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="Keine KI-Module konfiguriert"
              description="Es wurden noch keine KI-Module für Ihr Unternehmen eingerichtet."
              action={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Modul hinzufügen
                </Button>
              }
            />
          ) : (
            <AIModuleToggle 
              modules={aiModules} 
              onToggle={handleModuleToggle}
            />
          )}
        </TabsContent>

        <TabsContent value="workflows">
          {workflowsLoading ? (
            <p className="text-muted-foreground">Lade Workflows...</p>
          ) : workflows.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="Keine Workflows vorhanden"
              description="Erstellen Sie automatisierte Workflows, um Prozesse zu optimieren."
              action={
                <Button onClick={handleCreateWorkflow}>
                  <Plus className="h-4 w-4 mr-2" />
                  Workflow erstellen
                </Button>
              }
            />
          ) : (
            <WorkflowSettings
              workflows={workflows}
              onToggle={handleWorkflowToggle}
              onEdit={handleWorkflowEdit}
              onDelete={handleWorkflowDelete}
              onCreateNew={handleCreateWorkflow}
            />
          )}
        </TabsContent>

        <TabsContent value="thresholds">
          {thresholdRules.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Keine Schwellenwerte definiert"
              description="Definieren Sie Schwellenwerte für automatische Benachrichtigungen."
              action={
                <Button onClick={() => handleAddThresholdRule({ process: '', threshold: 0, unit: '%', operator: 'greater', enabled: true, category: 'risk' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schwellenwert hinzufügen
                </Button>
              }
            />
          ) : (
            <ThresholdSettings
              rules={thresholdRules}
              onUpdateRule={handleUpdateThresholdRule}
              onAddRule={handleAddThresholdRule}
            />
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {notificationRules.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Keine Benachrichtigungsregeln"
              description="Konfigurieren Sie Benachrichtigungsregeln für KI-Ereignisse."
            />
          ) : (
            <NotificationSettings
              rules={notificationRules}
              onUpdateRule={handleUpdateNotificationRule}
            />
          )}
        </TabsContent>

        <TabsContent value="data-policy">
          {dataPolicies.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Keine Datenschutzrichtlinien"
              description="Definieren Sie Datenschutzrichtlinien für KI-Verarbeitung."
            />
          ) : (
            <DataPolicySettings
              policies={dataPolicies}
              onUpdatePolicy={handleUpdateDataPolicy}
            />
          )}
        </TabsContent>

        <TabsContent value="audit">
          {logsLoading ? (
            <p className="text-muted-foreground">Lade Protokoll...</p>
          ) : auditLogs.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Keine Aktivitäten"
              description="Es wurden noch keine KI-Aktivitäten protokolliert."
            />
          ) : (
            <AIAuditLog
              logs={auditLogs}
              onExport={handleExportAuditLog}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
