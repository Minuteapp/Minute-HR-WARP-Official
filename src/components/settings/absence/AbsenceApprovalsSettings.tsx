import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Users, ArrowRight, Save, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

export const AbsenceApprovalsSettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');
  const [workflowType, setWorkflowType] = useState('2-stage');

  const handleSave = () => {
    toast({
      title: "Genehmigungseinstellungen gespeichert",
      description: "Die Genehmigungsworkflows wurden erfolgreich aktualisiert.",
    });
  };

  const WorkflowStage = ({ 
    stage, 
    title, 
    description, 
    isActive 
  }: { 
    stage: number; 
    title: string; 
    description: string;
    isActive: boolean;
  }) => (
    <div className={`p-4 rounded-lg border ${isActive ? 'bg-accent/50' : 'bg-muted/50'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          {stage}
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {isActive && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Genehmiger-Rolle</Label>
            <Select disabled={!canEdit}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Direkter Vorgesetzter</SelectItem>
                <SelectItem value="hr">HR Manager</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="compliance">Compliance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Maximale Bearbeitungszeit (Tage)</Label>
            <Input
              type="number"
              defaultValue="7"
              disabled={!canEdit}
              placeholder="7"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Stellvertretung erlaubt</Label>
              <p className="text-sm text-muted-foreground">
                Stellvertreter können Anträge genehmigen
              </p>
            </div>
            <Switch disabled={!canEdit} defaultChecked />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Genehmigungsworkflows</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workflow-Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Genehmigungsworkflow</Label>
            <Select value={workflowType} onValueChange={setWorkflowType} disabled={!canEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-stage">1-stufig (nur Vorgesetzter)</SelectItem>
                <SelectItem value="2-stage">2-stufig (Vorgesetzter + HR)</SelectItem>
                <SelectItem value="3-stage">3-stufig (Vorgesetzter + HR + Admin)</SelectItem>
                <SelectItem value="auto">Automatische Genehmigung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Workflow-Stufen
            </h4>
            
            <div className="space-y-4">
              <WorkflowStage
                stage={1}
                title="Direkter Vorgesetzter"
                description="Erste Genehmigungsinstanz"
                isActive={['1-stage', '2-stage', '3-stage'].includes(workflowType)}
              />
              
              <WorkflowStage
                stage={2}
                title="HR Manager"
                description="Personalmanagement prüft den Antrag"
                isActive={['2-stage', '3-stage'].includes(workflowType)}
              />
              
              <WorkflowStage
                stage={3}
                title="Administrator / Compliance"
                description="Finale Freigabe bei kritischen Anträgen"
                isActive={workflowType === '3-stage'}
              />
            </div>
          </div>

          {workflowType === 'auto' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  Automatische Genehmigung
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Anträge werden automatisch genehmigt. Dies sollte nur für unkritische 
                Abwesenheitsarten (z.B. Homeoffice) verwendet werden.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Eskalationslogik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Erinnerung nach (Tage)</Label>
              <Input
                id="reminder-days"
                type="number"
                defaultValue="3"
                disabled={!canEdit}
                placeholder="3"
              />
              <p className="text-sm text-muted-foreground">
                Erste Erinnerung an den Genehmiger
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalation-days">Eskalation nach (Tage)</Label>
              <Input
                id="escalation-days"
                type="number"
                defaultValue="7"
                disabled={!canEdit}
                placeholder="7"
              />
              <p className="text-sm text-muted-foreground">
                Automatische Weiterleitung an nächste Instanz
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>E-Mail-Erinnerungen aktiviert</Label>
                <p className="text-sm text-muted-foreground">
                  Genehmiger erhalten E-Mail-Benachrichtigungen bei offenen Anträgen
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatische Eskalation</Label>
                <p className="text-sm text-muted-foreground">
                  Anträge werden automatisch an die nächste Instanz weitergeleitet
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Wochenend-Pause für Eskalation</Label>
                <p className="text-sm text-muted-foreground">
                  Eskalations-Timer pausiert an Wochenenden und Feiertagen
                </p>
              </div>
              <Switch disabled={!canEdit} defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kommentar-Vorlagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-template">Vorlage für Genehmigung</Label>
            <Textarea
              id="approval-template"
              defaultValue="Ihr Antrag wurde genehmigt. Wir wünschen Ihnen eine schöne Zeit!"
              disabled={!canEdit}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-template">Vorlage für Ablehnung</Label>
            <Textarea
              id="rejection-template"
              defaultValue="Leider können wir Ihren Antrag für den gewünschten Zeitraum nicht genehmigen. Bitte wenden Sie sich an Ihren Vorgesetzten für weitere Informationen."
              disabled={!canEdit}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-request-template">Vorlage für Änderungsanfrage</Label>
            <Textarea
              id="change-request-template"
              defaultValue="Bitte passen Sie Ihren Antrag entsprechend den folgenden Hinweisen an:"
              disabled={!canEdit}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      )}
    </div>
  );
};