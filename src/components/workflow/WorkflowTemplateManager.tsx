import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Settings,
  Users,
  FileText,
  Clock,
  Zap,
  Star,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { predefinedWorkflowTemplates, type PredefinedWorkflowTemplate } from '@/data/predefinedWorkflowTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow_type: string;
  is_active: boolean;
  approval_steps: any[];
  conditions: any;
  auto_approval_rules: any[];
  notification_settings: any;
  created_at: string;
}

interface WorkflowStep {
  step: number;
  type: string;
  approver_role: string;
  description: string;
  conditions?: any;
}

export const WorkflowTemplateManager = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflow_type: 'absence_approval',
    is_active: true,
    approval_steps: [] as WorkflowStep[],
    conditions: {},
    auto_approval_rules: [],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24, 72]
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Templates",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        ...formData,
        approval_steps: formData.approval_steps,
        conditions: formData.conditions,
        auto_approval_rules: formData.auto_approval_rules,
        notification_settings: formData.notification_settings
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('workflow_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: "Template erfolgreich aktualisiert" });
      } else {
        const { error } = await supabase
          .from('workflow_templates')
          .insert([templateData]);

        if (error) throw error;
        toast({ title: "Template erfolgreich erstellt" });
      }

      setShowCreateDialog(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Template löschen möchten?')) return;

    try {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast({ title: "Template erfolgreich gelöscht" });
      fetchTemplates();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Löschen",
        description: error.message
      });
    }
  };

  const handleDuplicateTemplate = async (template: WorkflowTemplate) => {
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .insert([{
          name: `${template.name} (Kopie)`,
          description: template.description,
          workflow_type: template.workflow_type,
          approval_steps: template.approval_steps,
          conditions: template.conditions,
          auto_approval_rules: template.auto_approval_rules,
          notification_settings: template.notification_settings,
          is_active: false
        }]);

      if (error) throw error;
      toast({ title: "Template erfolgreich kopiert" });
      fetchTemplates();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Kopieren",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      workflow_type: 'absence_approval',
      is_active: true,
      approval_steps: [],
      conditions: {},
      auto_approval_rules: [],
      notification_settings: {
        send_confirmation: true,
        send_reminders: true,
        reminder_hours: [24, 72]
      }
    });
  };

  const addApprovalStep = () => {
    const newStep: WorkflowStep = {
      step: formData.approval_steps.length + 1,
      type: 'approval',
      approver_role: 'manager',
      description: `Schritt ${formData.approval_steps.length + 1}`
    };
    setFormData({
      ...formData,
      approval_steps: [...formData.approval_steps, newStep]
    });
  };

  const removeApprovalStep = (index: number) => {
    const updatedSteps = formData.approval_steps.filter((_, i) => i !== index);
    // Re-number steps
    const renumberedSteps = updatedSteps.map((step, i) => ({
      ...step,
      step: i + 1
    }));
    setFormData({
      ...formData,
      approval_steps: renumberedSteps
    });
  };

  const updateApprovalStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...formData.approval_steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setFormData({
      ...formData,
      approval_steps: updatedSteps
    });
  };

  const getWorkflowTypeDisplay = (type: string) => {
    switch (type) {
      case 'absence_approval': return 'Urlaubsantrag';
      case 'overtime_approval': return 'Überstunden';
      case 'expense_approval': return 'Ausgaben';
      case 'time_off_approval': return 'Freistellung';
      case 'general_approval': return 'Allgemein';
      default: return type;
    }
  };

  const editTemplate = (template: WorkflowTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      workflow_type: template.workflow_type,
      is_active: template.is_active,
      approval_steps: template.approval_steps || [],
      conditions: template.conditions || {},
      auto_approval_rules: template.auto_approval_rules || [],
      notification_settings: template.notification_settings || {
        send_confirmation: true,
        send_reminders: true,
        reminder_hours: [24, 72]
      }
    });
    setShowCreateDialog(true);
  };

  const installPredefinedTemplate = async (predefinedTemplate: PredefinedWorkflowTemplate) => {
    try {
      const templateData = {
        name: predefinedTemplate.name,
        description: predefinedTemplate.description,
        workflow_type: predefinedTemplate.workflow_type,
        is_active: true,
        approval_steps: predefinedTemplate.approval_steps,
        conditions: predefinedTemplate.conditions,
        auto_approval_rules: predefinedTemplate.auto_approval_rules,
        notification_settings: predefinedTemplate.notification_settings
      };

      const { error } = await supabase
        .from('workflow_templates')
        .insert([templateData]);

      if (error) throw error;
      
      toast({ 
        title: "Vorlage installiert", 
        description: `"${predefinedTemplate.name}" wurde erfolgreich zu Ihren Templates hinzugefügt.`
      });
      
      fetchTemplates();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Installieren",
        description: error.message
      });
    }
  };

  const getUniqueCategories = () => {
    const categories = predefinedWorkflowTemplates.map(t => t.category);
    return ['alle', ...Array.from(new Set(categories))];
  };

  const getFilteredPredefinedTemplates = () => {
    if (selectedCategory === 'alle') {
      return predefinedWorkflowTemplates;
    }
    return predefinedWorkflowTemplates.filter(t => t.category === selectedCategory);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Mitarbeiter-Lifecycle': '👨‍💼',
      'Abwesenheiten & Gesundheit': '🧑‍⚕️',
      'Zeiterfassung & Schichtplanung': '🕒',
      'Projekte, Aufgaben & Roadmap': '💼',
      'Dokumente & Compliance': '📑',
      'Geschäftsreisen & Spesen': '🌍',
      'Nachhaltigkeit & Lieferketten': '🌱',
      'Innovation & Ideen': '💡',
      'Kommunikation & Helpdesk': '📢',
      'KI & Automatisierungen': '🤖'
    };
    return iconMap[category] || '⚡';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">Erstelle und verwalte Workflow-Vorlagen für alle Module</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Template bearbeiten' : 'Neues Template erstellen'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Standard Urlaubsantrag"
                  />
                </div>
                <div>
                  <Label htmlFor="workflow_type">Workflow Typ</Label>
                  <Select value={formData.workflow_type} onValueChange={(value) => setFormData({ ...formData, workflow_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absence_approval">Urlaubsantrag</SelectItem>
                      <SelectItem value="overtime_approval">Überstunden</SelectItem>
                      <SelectItem value="expense_approval">Ausgaben</SelectItem>
                      <SelectItem value="time_off_approval">Freistellung</SelectItem>
                      <SelectItem value="general_approval">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschreibung des Workflows..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Template aktiv</Label>
              </div>

              {/* Approval Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium">Genehmigungsschritte</Label>
                  <Button type="button" onClick={addApprovalStep} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Schritt hinzufügen
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.approval_steps.map((step, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div>
                          <Label>Schritt {step.step}</Label>
                          <Input
                            value={step.description}
                            onChange={(e) => updateApprovalStep(index, 'description', e.target.value)}
                            placeholder="Beschreibung"
                          />
                        </div>
                        <div>
                          <Label>Typ</Label>
                          <Select 
                            value={step.type} 
                            onValueChange={(value) => updateApprovalStep(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approval">Genehmigung</SelectItem>
                              <SelectItem value="notification">Benachrichtigung</SelectItem>
                              <SelectItem value="automatic">Automatisch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Genehmiger Rolle</Label>
                          <Select 
                            value={step.approver_role} 
                            onValueChange={(value) => updateApprovalStep(index, 'approver_role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="employee">Mitarbeiter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => removeApprovalStep(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                >
                  Abbrechen
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="predefined" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined" className="gap-2">
            <Star className="h-4 w-4" />
            Vorgefertigte Vorlagen (20)
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Settings className="h-4 w-4" />
            Meine Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Kategorie:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getUniqueCategories().map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'alle' ? '🔍 Alle' : `${getCategoryIcon(category)} ${category}`}
                </Button>
              ))}
            </div>
          </div>

          {/* Predefined Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredPredefinedTemplates().map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(template.category)}</span>
                        <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      KI-optimiert
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Trigger:</span>
                      <span>{template.trigger.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Aktionen:</span>
                      <span>{template.actions.length} Schritte</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">Module:</span>
                      <span>{Array.from(new Set(template.actions.map(a => a.target_module))).slice(0, 3).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => installPredefinedTemplate(template)}
                    className="w-full gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Template installieren
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredPredefinedTemplates().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-base font-medium mb-2">Keine Templates in dieser Kategorie</h3>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie eine andere Kategorie oder "Alle" um alle verfügbaren Templates zu sehen.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Custom Templates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {getWorkflowTypeDisplay(template.workflow_type)}
                      </Badge>
                    </div>
                    <Badge variant={template.is_active ? "default" : "outline"}>
                      {template.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description || 'Keine Beschreibung vorhanden'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3 w-3" />
                      <span>{(template.approval_steps || []).length} Genehmigungsschritte</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Erstellt: {new Date(template.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => editTemplate(template)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Kopieren
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Keine eigenen Templates vorhanden</h3>
                <p className="text-muted-foreground mb-4">
                  Erstellen Sie Ihr erstes eigenes Workflow-Template oder installieren Sie eine vorgefertigte Vorlage.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Template
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const predefinedTab = document.querySelector('[value="predefined"]') as HTMLElement;
                    predefinedTab?.click();
                  }}>
                    <Star className="h-4 w-4 mr-2" />
                    Vorlagen ansehen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};