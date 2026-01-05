import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Settings } from 'lucide-react';
import type { WorkflowNode } from '../tabs/BuilderTab';

interface PropertiesPanelProps {
  node: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  onUpdateNode,
  onDeleteNode,
}) => {
  if (!node) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Eigenschaften</CardTitle>
          <CardDescription className="text-xs">Baustein konfigurieren</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Wähle einen Baustein im Canvas aus, um seine Eigenschaften zu bearbeiten.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Eigenschaften</CardTitle>
        <CardDescription className="text-xs">Baustein konfigurieren</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="node-label">Bezeichnung</Label>
          <Input
            id="node-label"
            value={node.label}
            onChange={(e) => onUpdateNode(node.id, { label: e.target.value })}
          />
        </div>

        {/* Event Type (for triggers) */}
        {node.type === 'trigger' && (
          <div className="space-y-2">
            <Label htmlFor="event-type">Event-Typ</Label>
            <Input
              id="event-type"
              placeholder="z.B. absence.requested"
              value={node.config.eventType || ''}
              onChange={(e) => onUpdateNode(node.id, { 
                config: { ...node.config, eventType: e.target.value } 
              })}
            />
          </div>
        )}

        {/* Module */}
        <div className="space-y-2">
          <Label htmlFor="module">Modul</Label>
          <Input
            id="module"
            placeholder="z.B. Abwesenheit"
            value={node.config.module || ''}
            onChange={(e) => onUpdateNode(node.id, { 
              config: { ...node.config, module: e.target.value } 
            })}
          />
        </div>

        {/* Security & Compliance */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Sicherheit & Compliance</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rls" 
              checked={node.config.rowLevelSecurity ?? true}
              onCheckedChange={(checked) => onUpdateNode(node.id, { 
                config: { ...node.config, rowLevelSecurity: checked } 
              })}
            />
            <label htmlFor="rls" className="text-sm text-muted-foreground cursor-pointer">
              Row Level Security
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="role-check" 
              checked={node.config.roleCheck ?? true}
              onCheckedChange={(checked) => onUpdateNode(node.id, { 
                config: { ...node.config, roleCheck: checked } 
              })}
            />
            <label htmlFor="role-check" className="text-sm text-muted-foreground cursor-pointer">
              Rollenprüfung
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pii-mask" 
              checked={node.config.piiMasking ?? true}
              onCheckedChange={(checked) => onUpdateNode(node.id, { 
                config: { ...node.config, piiMasking: checked } 
              })}
            />
            <label htmlFor="pii-mask" className="text-sm text-muted-foreground cursor-pointer">
              PII-Maskierung
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="audit" 
              checked={node.config.auditLog ?? true}
              onCheckedChange={(checked) => onUpdateNode(node.id, { 
                config: { ...node.config, auditLog: checked } 
              })}
            />
            <label htmlFor="audit" className="text-sm text-muted-foreground cursor-pointer">
              Audit-Protokoll
            </label>
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onDeleteNode(node.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Baustein löschen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
