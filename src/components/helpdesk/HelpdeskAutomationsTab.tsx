import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Settings, 
  Calendar,
  Plus,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { CreateWorkflowDialog } from './CreateWorkflowDialog';
import { useHelpdeskWorkflows, useUpdateHelpdeskWorkflow } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from 'react';

export const HelpdeskAutomationsTab = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { data: workflows, isLoading } = useHelpdeskWorkflows();
  const updateWorkflow = useUpdateHelpdeskWorkflow();

  const activeWorkflows = workflows?.filter(w => w.is_active) || [];
  const totalExecutions = workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0;

  const stats = [
    { 
      label: 'Aktive Workflows', 
      value: activeWorkflows.length.toString(), 
      icon: Play, 
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Gesamt-Ausführungen', 
      value: totalExecutions.toString(), 
      icon: TrendingUp, 
      iconColor: 'text-purple-600'
    },
    { 
      label: 'Workflows gesamt', 
      value: (workflows?.length || 0).toString(), 
      icon: CheckCircle, 
      iconColor: 'text-green-600'
    },
    { 
      label: 'Automatisierung', 
      value: activeWorkflows.length > 0 ? 'Aktiv' : 'Inaktiv', 
      icon: Clock, 
      iconColor: 'text-orange-600'
    }
  ];

  const handleToggleWorkflow = (id: string, currentActive: boolean) => {
    updateWorkflow.mutate({ id, is_active: !currentActive });
  };

  const parseActions = (actions: unknown): string[] => {
    if (Array.isArray(actions)) {
      return actions.map(a => {
        if (typeof a === 'string') return a;
        if (typeof a === 'object' && a !== null && 'name' in a) return String((a as Record<string, unknown>).name);
        return JSON.stringify(a);
      });
    }
    return [];
  };

  const parseTriggerConditions = (conditions: unknown): string => {
    if (typeof conditions === 'object' && conditions !== null) {
      const cond = conditions as Record<string, unknown>;
      if (cond.category) return `ticket.created (Kategorie: ${cond.category})`;
      if (cond.event) return String(cond.event);
    }
    return 'Benutzerdefiniert';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Automatisierungen & Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie automatische Prozesse und Trigger
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neuer Workflow
        </Button>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-background border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow-Cards */}
      <div className="space-y-4">
        {workflows && workflows.length > 0 ? (
          workflows.map((workflow) => {
            const actions = parseActions(workflow.actions);
            const trigger = parseTriggerConditions(workflow.trigger_conditions);
            
            return (
              <Card key={workflow.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header Row */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                          {workflow.is_active && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Aktiv
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {workflow.trigger_type === 'ticket_created' ? 'Wird bei neuen Tickets ausgelöst' : workflow.trigger_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={workflow.is_active || false} 
                        onCheckedChange={() => handleToggleWorkflow(workflow.id, workflow.is_active || false)}
                        disabled={updateWorkflow.isPending}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/helpdesk/workflow/${workflow.id}`)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="border-t bg-muted/30 p-4 space-y-4">
                    {/* Trigger */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Trigger</p>
                      <div className="inline-block px-3 py-1.5 bg-muted text-foreground rounded-md text-sm font-mono">
                        {trigger}
                      </div>
                    </div>

                    {/* Aktionen */}
                    {actions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Aktionen ({actions.length})
                        </p>
                        <div className="space-y-2">
                          {actions.map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                                {idx + 1}
                              </div>
                              <span className="text-sm text-foreground">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statistiken */}
                    <div className="flex items-center gap-6 pt-2 border-t text-sm text-muted-foreground">
                      <span>Ausführungen: {workflow.execution_count || 0}</span>
                      {workflow.last_executed_at && (
                        <span>Zuletzt: {new Date(workflow.last_executed_at).toLocaleDateString('de-DE')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Keine Workflows vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihren ersten Workflow, um Prozesse zu automatisieren.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Workflow erstellen
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Workflow Dialog */}
      <CreateWorkflowDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};