
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Layout,
  FileText,
  Target,
  BarChart3,
  DollarSign,
  GraduationCap,
  UserPlus,
  Save,
  Eye
} from 'lucide-react';

const templateTypes = [
  { value: 'document', label: 'Dokument', icon: FileText, color: 'text-blue-600' },
  { value: 'goal', label: 'Ziel', icon: Target, color: 'text-green-600' },
  { value: 'performance', label: 'Performance', icon: BarChart3, color: 'text-purple-600' },
  { value: 'budget', label: 'Budget', icon: DollarSign, color: 'text-yellow-600' },
  { value: 'training', label: 'Weiterbildung', icon: GraduationCap, color: 'text-indigo-600' },
  { value: 'recruiting', label: 'Recruiting', icon: UserPlus, color: 'text-orange-600' },
  { value: 'custom', label: 'Benutzerdefiniert', icon: Layout, color: 'text-gray-600' }
];

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Mehrzeiliger Text' },
  { value: 'number', label: 'Zahl' },
  { value: 'date', label: 'Datum' },
  { value: 'select', label: 'Auswahl' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Bewertung' },
  { value: 'file', label: 'Datei-Upload' }
];

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  default?: any;
}

export const CustomTemplateSettings = () => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const addField = () => {
    const newField: TemplateField = {
      id: Date.now().toString(),
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const saveTemplate = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      type: templateType,
      category: templateCategory,
      fields,
      isActive,
      isPublic,
      hasSignature,
      createdAt: new Date().toISOString()
    };
    
    console.log('Template gespeichert:', template);
    // Hier würde die Template-Speicherung implementiert werden
  };

  const previewTemplate = () => {
    console.log('Template-Vorschau für:', templateName);
    // Hier würde die Template-Vorschau implementiert werden
  };

  const getTemplateTypeIcon = (type: string) => {
    const templateType = templateTypes.find(t => t.value === type);
    if (templateType) {
      const IconComponent = templateType.icon;
      return <IconComponent className={`h-4 w-4 ${templateType.color}`} />;
    }
    return <Layout className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Eigenes Template erstellen</h3>
        <p className="text-gray-600">Erstellen Sie benutzerdefinierte Templates für Ihre spezifischen Anforderungen</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template-Grunddaten */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template-Grunddaten</CardTitle>
              <CardDescription>Definieren Sie die Basis-Eigenschaften Ihres Templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template-Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="z.B. Kundenbewertung Formular"
                  />
                </div>
                <div>
                  <Label htmlFor="templateType">Template-Typ</Label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="templateDescription">Beschreibung</Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Beschreiben Sie den Zweck und Verwendung des Templates"
                />
              </div>
              <div>
                <Label htmlFor="templateCategory">Kategorie</Label>
                <Input
                  id="templateCategory"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  placeholder="z.B. Kundenfeedback, Interne Prozesse"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template-Felder */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Template-Felder</CardTitle>
                  <CardDescription>Definieren Sie die Felder für Ihr Template</CardDescription>
                </div>
                <Button onClick={addField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Feld hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Noch keine Felder definiert</p>
                  <p className="text-sm">Klicken Sie auf "Feld hinzufügen" um zu starten</p>
                </div>
              ) : (
                fields.map((field) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{fieldTypes.find(t => t.value === field.type)?.label}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(field.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Feld-Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              placeholder="feldname"
                            />
                          </div>
                          <div>
                            <Label>Bezeichnung</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="Bezeichnung für Benutzer"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Feld-Typ</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) => updateField(field.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Platzhaltertext</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              placeholder="Hilfetext für Benutzer"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                          />
                          <Label>Pflichtfeld</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template-Einstellungen */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Template aktivieren</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublic">Öffentlich verfügbar</Label>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hasSignature">Digitale Signatur</Label>
                <Switch
                  id="hasSignature"
                  checked={hasSignature}
                  onCheckedChange={setHasSignature}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template-Vorschau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                {getTemplateTypeIcon(templateType)}
                <span className="font-medium">{templateName || 'Unbenanntes Template'}</span>
              </div>
              <p className="text-sm text-gray-600">
                {templateDescription || 'Keine Beschreibung'}
              </p>
              <div className="space-y-2">
                <Badge variant="outline">{fields.length} Felder</Badge>
                {templateCategory && (
                  <Badge variant="secondary">{templateCategory}</Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={previewTemplate}
                disabled={!templateName || fields.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vorschau anzeigen
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={saveTemplate}
              disabled={!templateName || fields.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Template speichern
            </Button>
            <Button variant="outline" className="w-full">
              Als Entwurf speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
