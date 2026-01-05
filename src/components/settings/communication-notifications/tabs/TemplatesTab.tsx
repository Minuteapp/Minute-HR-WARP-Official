
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, FileText, Eye, Loader2, Copy } from "lucide-react";

const AVAILABLE_VARIABLES = [
  { name: '{{name}}', description: 'Name des Empfängers' },
  { name: '{{date}}', description: 'Aktuelles Datum' },
  { name: '{{time}}', description: 'Aktuelle Uhrzeit' },
  { name: '{{status}}', description: 'Status des Objekts' },
  { name: '{{link}}', description: 'Link zum Objekt' },
  { name: '{{company}}', description: 'Firmenname' },
  { name: '{{manager}}', description: 'Name des Vorgesetzten' },
  { name: '{{department}}', description: 'Abteilung' },
];

const LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
];

const CHANNELS = ['email', 'in-app', 'push', 'sms', 'slack'];

export default function TemplatesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('event_type', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (template: any) => {
      if (template.id) {
        const { error } = await supabase
          .from('notification_templates')
          .update(template)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_templates')
          .insert(template);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Vorlage gespeichert');
      setDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Vorlage gelöscht');
    }
  });

  const openCreateDialog = () => {
    setEditingTemplate({
      event_type: '',
      channel: 'email',
      language: 'de',
      template_name: '',
      subject_template: '',
      body_template: '',
      use_company_branding: true,
      is_active: true
    });
    setDialogOpen(true);
  };

  const insertVariable = (variable: string) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        body_template: (editingTemplate.body_template || '') + variable
      });
    }
  };

  const renderPreview = (template: string) => {
    return template
      .replace(/\{\{name\}\}/g, 'Max Mustermann')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('de-DE'))
      .replace(/\{\{time\}\}/g, new Date().toLocaleTimeString('de-DE'))
      .replace(/\{\{status\}\}/g, 'Genehmigt')
      .replace(/\{\{link\}\}/g, 'https://app.example.com/...')
      .replace(/\{\{company\}\}/g, 'Musterfirma GmbH')
      .replace(/\{\{manager\}\}/g, 'Anna Schmidt')
      .replace(/\{\{department\}\}/g, 'Entwicklung');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nachrichtenvorlagen</CardTitle>
              <CardDescription>
                Erstellen und verwalten Sie Vorlagen für Benachrichtigungen
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Vorlage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine Vorlagen definiert
              </p>
            ) : (
              templates?.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{template.template_name}</h4>
                          {!template.is_active && (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{template.event_type}</Badge>
                          <Badge variant="outline">{template.channel}</Badge>
                          <Badge variant="outline">
                            {LANGUAGES.find(l => l.code === template.language)?.name || template.language}
                          </Badge>
                        </div>
                        {template.subject_template && (
                          <p className="text-sm text-muted-foreground">
                            Betreff: {template.subject_template}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setEditingTemplate(template);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Vorlage wirklich löschen?')) {
                              deleteMutation.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTemplate && (
            <Tabs defaultValue="edit" className="space-y-4">
              <TabsList>
                <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
                <TabsTrigger value="preview">Vorschau</TabsTrigger>
                <TabsTrigger value="variables">Variablen</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Event-Typ</Label>
                    <Input
                      value={editingTemplate.event_type}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, event_type: e.target.value })}
                      placeholder="z.B. absence.approved"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kanal</Label>
                    <Select
                      value={editingTemplate.channel}
                      onValueChange={(value) => setEditingTemplate({ ...editingTemplate, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNELS.map(channel => (
                          <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sprache</Label>
                    <Select
                      value={editingTemplate.language}
                      onValueChange={(value) => setEditingTemplate({ ...editingTemplate, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vorlagenname</Label>
                  <Input
                    value={editingTemplate.template_name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                    placeholder="z.B. Abwesenheit genehmigt - E-Mail"
                  />
                </div>

                {editingTemplate.channel === 'email' && (
                  <div className="space-y-2">
                    <Label>Betreff</Label>
                    <Input
                      value={editingTemplate.subject_template || ''}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject_template: e.target.value })}
                      placeholder="z.B. Ihre Abwesenheit wurde genehmigt"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Nachrichtentext</Label>
                  <Textarea
                    value={editingTemplate.body_template}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body_template: e.target.value })}
                    placeholder="Hallo {{name}}, ..."
                    rows={8}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.use_company_branding}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, use_company_branding: checked })}
                    />
                    <Label>Firmen-Branding verwenden</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingTemplate.is_active}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, is_active: checked })}
                    />
                    <Label>Aktiv</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vorschau</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingTemplate.subject_template && (
                      <div className="mb-4 pb-4 border-b">
                        <Label className="text-muted-foreground">Betreff:</Label>
                        <p className="font-medium">{renderPreview(editingTemplate.subject_template)}</p>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {renderPreview(editingTemplate.body_template || '')}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verfügbare Variablen</CardTitle>
                    <CardDescription>
                      Klicken Sie auf eine Variable, um sie in den Text einzufügen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_VARIABLES.map(variable => (
                        <Button
                          key={variable.name}
                          variant="outline"
                          className="justify-start"
                          onClick={() => insertVariable(variable.name)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          <span className="font-mono">{variable.name}</span>
                          <span className="ml-2 text-muted-foreground text-xs">
                            - {variable.description}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => saveMutation.mutate(editingTemplate)}
                  disabled={!editingTemplate.event_type || !editingTemplate.template_name || !editingTemplate.body_template}
                >
                  Speichern
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
