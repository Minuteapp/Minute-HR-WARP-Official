import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, Bell, Users } from 'lucide-react';
import type { CreateObjectiveInput } from '@/types/objectives';

interface ApprovalStepProps {
  data: Partial<CreateObjectiveInput>;
  onUpdate: (updates: Partial<CreateObjectiveInput>) => void;
}

export const ApprovalStep = ({ data, onUpdate }: ApprovalStepProps) => {
  return (
    <div className="space-y-6">
      {/* Approval Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-medium">Genehmigungsworkflow</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Genehmigung erforderlich</Label>
              <p className="text-xs text-muted-foreground">
                Ziel muss vor Aktivierung genehmigt werden
              </p>
            </div>
            <Switch
              checked={data.requires_approval || false}
              onCheckedChange={(checked) => onUpdate({ requires_approval: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Escalation Rules */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h4 className="text-sm font-medium">Automatische Benachrichtigungen</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>E-Mail Benachrichtigungen</Label>
              <p className="text-xs text-muted-foreground">
                Bei Statusänderungen informieren
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>App-Benachrichtigungen</Label>
              <p className="text-xs text-muted-foreground">
                Push-Benachrichtigungen aktivieren
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Zusammenfassung</h4>
            <p className="text-sm text-muted-foreground">
              Ihr Ziel wird {data.requires_approval ? 'zur Genehmigung eingereicht' : 'direkt aktiviert'}. 
              Nach der Erstellung werden alle Beteiligten automatisch benachrichtigt.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};