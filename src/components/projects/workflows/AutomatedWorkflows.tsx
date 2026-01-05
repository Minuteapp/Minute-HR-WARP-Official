
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Bell
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkflowTrigger {
  id: string;
  type: 'status_change' | 'due_date' | 'progress' | 'budget_exceeded' | 'team_change';
  condition: string;
  value?: string | number;
}

interface WorkflowAction {
  id: string;
  type: 'notification' | 'email' | 'status_update' | 'assign_task' | 'create_reminder';
  target: string;
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  executionCount: number;
  lastExecuted?: Date;
  createdAt: Date;
}

const AutomatedWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Projekt-Deadline Warnung',
      description: 'Benachrichtigt Team 7 Tage vor Projektende',
      isActive: true,
      trigger: {
        id: 't1',
        type: 'due_date',
        condition: 'days_before',
        value: 7
      },
      actions: [
        {
          id: 'a1',
          type: 'notification',
          target: 'project_team',
          config: { message: 'Projekt-Deadline in 7 Tagen!' }
        },
        {
          id: 'a2',
          type: 'email',
          target: 'project_manager',
          config: { subject: 'Deadline-Erinnerung', template: 'deadline_warning' }
        }
      ],
      executionCount: 12,
      lastExecuted: new Date(2024, 0, 15),
      createdAt: new Date(2024, 0, 1)
    },
    {
      id: '2',
      name: 'Budget-Überschreitung Alert',
      description: 'Warnt bei 90% Budget-Verbrauch',
      isActive: true,
      trigger: {
        id: 't2',
        type: 'budget_exceeded',
        condition: 'percentage_reached',
        value: 90
      },
      actions: [
        {
          id: 'a3',
          type: 'notification',
          target: 'project_manager',
          config: { priority: 'high', message: 'Budget-Limit erreicht!' }
        }
      ],
      executionCount: 3,
      lastExecuted: new Date(2024, 0, 20),
      createdAt: new Date(2024, 0, 5)
    },
    {
      id: '3',
      name: 'Fortschritt-Tracker',
      description: 'Erstellt Aufgaben bei Meilenstein-Erreichen',
      isActive: false,
      trigger: {
        id: 't3',
        type: 'progress',
        condition: 'milestone_reached',
        value: 50
      },
      actions: [
        {
          id: 'a4',
          type: 'assign_task',
          target: 'project_team',
          config: { taskType: 'review', title: 'Zwischenbewertung' }
        }
      ],
      executionCount: 5,
      createdAt: new Date(2024, 0, 10)
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const toggleWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  }, []);

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      case 'due_date': return <Clock className="h-4 w-4" />;
      case 'progress': return <AlertTriangle className="h-4 w-4" />;
      case 'budget_exceeded': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'status_update': return <CheckCircle className="h-4 w-4" />;
      case 'assign_task': return <Plus className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getTriggerDescription = (trigger: WorkflowTrigger) => {
    switch (trigger.type) {
      case 'due_date':
        return `${trigger.value} Tage vor Deadline`;
      case 'progress':
        return `Bei ${trigger.value}% Fortschritt`;
      case 'budget_exceeded':
        return `Bei ${trigger.value}% Budget-Verbrauch`;
      case 'status_change':
        return `Bei Status-Änderung zu "${trigger.value}"`;
      default:
        return trigger.condition;
    }
  };

  const getActionDescription = (action: WorkflowAction) => {
    switch (action.type) {
      case 'notification':
        return `Benachrichtigung an ${action.target}`;
      case 'email':
        return `E-Mail an ${action.target}`;
      case 'status_update':
        return `Status aktualisieren`;
      case 'assign_task':
        return `Aufgabe zuweisen`;
      default:
        return action.type;
    }
  };

  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automatisierte Workflows</h1>
          <p className="text-gray-600">Trigger und Aktionen für Projektprozesse</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Workflow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Workflows</p>
                <p className="text-2xl font-bold">{activeWorkflows}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausführungen</p>
                <p className="text-2xl font-bold">{totalExecutions}</p>
              </div>
              <Play className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{workflow.name}</h3>
                        <Badge variant={workflow.isActive ? "default" : "secondary"}>
                          {workflow.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{workflow.description}</p>
                      
                      {/* Trigger */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          {getTriggerIcon(workflow.trigger.type)}
                          Trigger
                        </h4>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm">
                            <strong>Wenn:</strong> {getTriggerDescription(workflow.trigger)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Aktionen ({workflow.actions.length})</h4>
                        <div className="space-y-2">
                          {workflow.actions.map((action) => (
                            <div key={action.id} className="bg-green-50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                {getActionIcon(action.type)}
                                <span className="text-sm">{getActionDescription(action)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>Ausgeführt: {workflow.executionCount}x</span>
                        {workflow.lastExecuted && (
                          <span>
                            Zuletzt: {workflow.lastExecuted.toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Erstellt: {workflow.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Switch
                        checked={workflow.isActive}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Deadline-Erinnerung',
                description: 'Benachrichtigt vor wichtigen Terminen',
                category: 'Zeitmanagement'
              },
              {
                name: 'Status-Automation',
                description: 'Automatische Statusupdates',
                category: 'Projektverwaltung'
              },
              {
                name: 'Budget-Überwachung',
                description: 'Warnt bei Budget-Überschreitungen',
                category: 'Finanzen'
              },
              {
                name: 'Team-Benachrichtigung',
                description: 'Informiert Teams über Änderungen',
                category: 'Kommunikation'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <Badge variant="outline">{template.category}</Badge>
                  <Button className="w-full mt-3" variant="outline">
                    Vorlage verwenden
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ausführungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    workflow: 'Projekt-Deadline Warnung',
                    project: 'Website Relaunch',
                    status: 'success',
                    timestamp: new Date(2024, 0, 20, 14, 30),
                    action: 'E-Mail gesendet'
                  },
                  {
                    workflow: 'Budget-Überschreitung Alert',
                    project: 'Mobile App',
                    status: 'success',
                    timestamp: new Date(2024, 0, 20, 10, 15),
                    action: 'Benachrichtigung erstellt'
                  },
                  {
                    workflow: 'Fortschritt-Tracker',
                    project: 'Backend API',
                    status: 'failed',
                    timestamp: new Date(2024, 0, 19, 16, 45),
                    action: 'Aufgabe nicht erstellt'
                  }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{entry.workflow}</p>
                      <p className="text-sm text-gray-600">Projekt: {entry.project}</p>
                      <p className="text-sm text-gray-600">{entry.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={entry.status === 'success' ? 'default' : 'destructive'}
                        className="mb-1"
                      >
                        {entry.status === 'success' ? 'Erfolgreich' : 'Fehler'}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedWorkflows;
