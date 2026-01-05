import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Tag, 
  AlertCircle, 
  Zap, 
  FileText,
  Bot,
  UserPlus,
  Flag,
  Mail,
  CalendarCheck,
  Briefcase,
  FileCheck,
  X,
  Check,
  Settings,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateHelpdeskWorkflow } from "@/hooks/useHelpdesk";

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TriggerOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ActionOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CreateWorkflowDialog = ({ open, onOpenChange }: CreateWorkflowDialogProps) => {
  const { toast } = useToast();
  const createWorkflow = useCreateHelpdeskWorkflow();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const triggerOptions: TriggerOption[] = [
    { id: 'ticket-created', name: 'Neues Ticket erstellt', description: 'Wird ausgelöst, wenn ein neues Ticket erstellt wird', icon: Sparkles },
    { id: 'ticket-category', name: 'Ticket mit Kategorie', description: 'Wird bei Tickets einer bestimmten Kategorie ausgelöst', icon: Tag },
    { id: 'ticket-escalated', name: 'Ticket eskaliert', description: 'Wird ausgelöst, wenn ein Ticket eskaliert wird', icon: AlertCircle },
    { id: 'ticket-overdue', name: 'Ticket überfällig', description: 'Wird ausgelöst, wenn ein Ticket die SLA überschreitet', icon: Zap },
    { id: 'attachment-uploaded', name: 'Anhang hochgeladen', description: 'Wird ausgelöst, wenn ein Anhang hochgeladen wird', icon: FileText }
  ];

  const actionOptions: ActionOption[] = [
    { id: 'ai-classify', name: 'KI-Klassifizierung', icon: Bot },
    { id: 'assign-to', name: 'Zuweisen an', icon: UserPlus },
    { id: 'set-priority', name: 'Priorität setzen', icon: Flag },
    { id: 'send-email', name: 'E-Mail senden', icon: Mail },
    { id: 'check-calendar', name: 'Kalender prüfen', icon: CalendarCheck },
    { id: 'check-vacation', name: 'Urlaubssaldo prüfen', icon: Briefcase },
    { id: 'create-document', name: 'Dokument erstellen', icon: FileCheck }
  ];

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.description)) {
      toast({
        title: 'Felder ausfüllen',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive'
      });
      return;
    }
    if (step === 2 && !selectedTrigger) {
      toast({
        title: 'Trigger auswählen',
        description: 'Bitte wählen Sie einen Trigger aus.',
        variant: 'destructive'
      });
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Mapping von UI-Trigger-IDs zu Datenbank-Trigger-Types
  const triggerTypeMapping: Record<string, string> = {
    'ticket-created': 'ticket_created',
    'ticket-category': 'ticket_category',
    'ticket-escalated': 'ticket_escalated',
    'ticket-overdue': 'ticket_overdue',
    'attachment-uploaded': 'attachment_uploaded'
  };

  // Mapping von UI-Action-IDs zu strukturierten Action-Objekten
  const actionTypeMapping: Record<string, { type: string; config: Record<string, unknown> }> = {
    'ai-classify': { type: 'ai_classify', config: {} },
    'assign-to': { type: 'assign_to', config: { assignee: null } },
    'set-priority': { type: 'set_priority', config: { priority: 'medium' } },
    'send-email': { type: 'send_email', config: { template: null } },
    'check-calendar': { type: 'check_calendar', config: {} },
    'check-vacation': { type: 'check_vacation', config: {} },
    'create-document': { type: 'create_document', config: { template: null } }
  };

  const handleCreate = async () => {
    if (selectedActions.length === 0) {
      toast({
        title: 'Aktionen hinzufügen',
        description: 'Bitte fügen Sie mindestens eine Aktion hinzu.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedTrigger) {
      toast({
        title: 'Trigger fehlt',
        description: 'Bitte wählen Sie einen Trigger aus.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const workflowData = {
        name: formData.name,
        description: formData.description,
        trigger_type: triggerTypeMapping[selectedTrigger] || selectedTrigger,
        trigger_conditions: {},
        actions: selectedActions.map(actionId => actionTypeMapping[actionId] || { type: actionId, config: {} }),
        is_active: true
      };

      await createWorkflow.mutateAsync(workflowData);

      // Reset and close
      setStep(1);
      setFormData({ name: '', description: '' });
      setSelectedTrigger(null);
      setSelectedActions([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Workflow creation error:', error);
      // Error toast is handled by the hook
    }
  };

  const toggleAction = (actionId: string) => {
    if (selectedActions.includes(actionId)) {
      setSelectedActions(selectedActions.filter(a => a !== actionId));
    } else {
      setSelectedActions([...selectedActions, actionId]);
    }
  };

  const removeAction = (actionId: string) => {
    setSelectedActions(selectedActions.filter(a => a !== actionId));
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Grundinformationen';
      case 2: return 'Trigger definieren';
      case 3: return 'Aktionen hinzufügen';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Neuen Workflow erstellen</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Schritt {step} von 3: {getStepDescription()}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Grundinformationen */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow-Name *</Label>
                <Input
                  id="workflow-name"
                  placeholder="z.B. Urlaubsantrag Automatisierung"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-description">Beschreibung *</Label>
                <Textarea
                  id="workflow-description"
                  placeholder="Beschreiben Sie, was dieser Workflow macht..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Workflow-Tipp Box - Weißer Hintergrund mit Border */}
              <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-violet-100">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Workflow-Tipp</p>
                    <p className="text-sm text-muted-foreground">
                      Ein guter Workflow-Name ist kurz und beschreibt die Hauptfunktion. 
                      Die Beschreibung sollte detailliert erklären, wann und wie der Workflow ausgelöst wird.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Trigger definieren - Blaues Auswahl-Styling */}
          {step === 2 && (
            <div className="space-y-4">
              <Label>Wählen Sie einen Trigger *</Label>
              <div className="space-y-3">
                {triggerOptions.map((trigger) => {
                  const isSelected = selectedTrigger === trigger.id;
                  return (
                    <Card 
                      key={trigger.id}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedTrigger(trigger.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${
                              isSelected 
                                ? 'bg-blue-500' 
                                : 'bg-gray-100'
                            }`}>
                              <trigger.icon className={`h-5 w-5 ${
                                isSelected 
                                  ? 'text-white' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold">{trigger.name}</p>
                              <p className={`text-sm ${
                                isSelected ? 'text-blue-600' : 'text-muted-foreground'
                              }`}>
                                {trigger.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              Ausgewählt
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Aktionen hinzufügen - Grünes Auswahl-Styling */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Verfügbare Aktionen</Label>
                <div className="grid grid-cols-2 gap-3">
                  {actionOptions.map((action) => {
                    const isSelected = selectedActions.includes(action.id);
                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        className={`h-auto p-4 justify-start ${
                          isSelected 
                            ? 'border-green-500 bg-green-50' 
                            : ''
                        }`}
                        onClick={() => toggleAction(action.id)}
                      >
                        <div className={`p-1.5 rounded-md mr-3 ${
                          isSelected ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <action.icon className={`h-4 w-4 ${
                            isSelected 
                              ? 'text-green-600' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <span className={isSelected ? 'text-green-700 font-medium' : ''}>
                          {action.name}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 ml-auto text-green-600" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Ausführungsreihenfolge mit blauen Nummer-Badges */}
              {selectedActions.length > 0 && (
                <div>
                  <Label className="mb-3 block">
                    Ausführungsreihenfolge ({selectedActions.length} Aktionen)
                  </Label>
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      {selectedActions.map((actionId, index) => {
                        const action = actionOptions.find(a => a.id === actionId);
                        if (!action) return null;
                        return (
                          <div 
                            key={actionId}
                            className="flex items-center justify-between p-3 border rounded-lg bg-background"
                          >
                            <div className="flex items-center gap-3">
                              {/* Blaues Nummer-Badge */}
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                {index + 1}
                              </div>
                              <action.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{action.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              >
                                <Settings className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeAction(actionId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Zurück
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>
                Weiter
              </Button>
            ) : (
              <Button 
                onClick={handleCreate} 
                className="bg-primary"
                disabled={createWorkflow.isPending}
              >
                {createWorkflow.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Erstelle...
                  </>
                ) : (
                  'Workflow erstellen'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
