import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Play, Pause, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  actions: string[];
  enabled: boolean;
  approvalRequired: boolean;
  executionCount: number;
  lastExecuted?: string;
}

interface WorkflowSettingsProps {
  workflows: AutomationWorkflow[];
  onToggle: (workflowId: string, enabled: boolean) => void;
  onEdit: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
  onCreateNew: () => void;
}

export function WorkflowSettings({ 
  workflows, 
  onToggle, 
  onEdit, 
  onDelete, 
  onCreateNew 
}: WorkflowSettingsProps) {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Automatisierte Workflows
          </CardTitle>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Workflow erstellen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Workflows konfiguriert</p>
            <Button onClick={onCreateNew} variant="outline" className="mt-4">
              Ersten Workflow erstellen
            </Button>
          </div>
        ) : (
          workflows.map((workflow) => (
            <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {workflow.enabled ? (
                      <Play className="h-4 w-4 text-green-600" />
                    ) : (
                      <Pause className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium">{workflow.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant={workflow.enabled ? "default" : "secondary"}>
                      {workflow.enabled ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    {workflow.approvalRequired && (
                      <Badge variant="outline">Genehmigung erforderlich</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={workflow.enabled}
                    onCheckedChange={(checked) => onToggle(workflow.id, checked)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(workflow.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(workflow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {workflow.description}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Trigger:</span> {workflow.triggerEvent}
                </div>
                <div className="flex gap-4">
                  <span>Ausführungen: {workflow.executionCount}</span>
                  {workflow.lastExecuted && (
                    <span>Zuletzt: {new Date(workflow.lastExecuted).toLocaleDateString('de-DE')}</span>
                  )}
                </div>
              </div>
              
              {workflow.actions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {workflow.actions.map((action, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}