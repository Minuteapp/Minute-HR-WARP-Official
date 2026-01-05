
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Award,
  Mail,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const trainingTemplates = [
  {
    id: '1',
    name: 'Teilnahmebestätigung Standard',
    description: 'Zertifikat für erfolgreich abgeschlossene Schulungen',
    category: 'certificate',
    isActive: true,
    usageCount: 42,
    lastUsed: '2024-01-15',
    fields: ['participant_name', 'course_title', 'completion_date', 'instructor_name'],
    trainingType: 'certificate',
    isAutomated: true,
    language: 'de'
  },
  {
    id: '2',
    name: 'Schulungseinladung E-Mail',
    description: 'Automatisierte Einladung zu Pflichtschulungen',
    category: 'invitation',
    isActive: true,
    usageCount: 67,
    lastUsed: '2024-01-14',
    fields: ['training_title', 'date_time', 'location', 'requirements'],
    trainingType: 'invitation',
    isAutomated: true,
    language: 'de'
  },
  {
    id: '3',
    name: 'Feedback-Formular Digital',
    description: 'Bewertungsbogen für Schulungsqualität und -zufriedenheit',
    category: 'feedback',
    isActive: true,
    usageCount: 35,
    lastUsed: '2024-01-13',
    fields: ['content_rating', 'instructor_rating', 'venue_rating', 'overall_satisfaction'],
    trainingType: 'feedback',
    isAutomated: false,
    language: 'de'
  }
];

export const TrainingTemplatesSettings = () => {
  const [templates, setTemplates] = useState(trainingTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const duplicateTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Kopie)`,
        usageCount: 0,
        lastUsed: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const getTrainingTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'invitation':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'checklist':
        return <CheckSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <GraduationCap className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Weiterbildung Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für Zertifikate, Einladungen und Feedback-Formulare</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neues Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neues Weiterbildung-Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Schulungen und Weiterbildungen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. DSGVO Schulungszertifikat" />
                </div>
                <div>
                  <Label htmlFor="trainingType">Template-Typ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Zertifikat</SelectItem>
                      <SelectItem value="invitation">Einladung</SelectItem>
                      <SelectItem value="feedback">Feedback-Formular</SelectItem>
                      <SelectItem value="checklist">Checkliste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Zertifikate</SelectItem>
                      <SelectItem value="invitation">Einladungen</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="assessment">Bewertungen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Sprache</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sprache wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Weiterbildungs-Templates" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="automated" />
                <Label htmlFor="automated">Automatisch generieren bei Ereignis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">Template aktivieren</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>
                  Template erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Templates durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="certificate">Zertifikate</SelectItem>
            <SelectItem value="invitation">Einladungen</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="assessment">Bewertungen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getTrainingTypeIcon(template.trainingType)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  {template.isAutomated && (
                    <Badge variant="outline" className="text-green-600">
                      Automatisch
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {template.language.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{template.usageCount}x verwendet</span>
                  <span>•</span>
                  <span>Zuletzt: {new Date(template.lastUsed).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{template.fields.length} Template-Felder</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => duplicateTemplate(template.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
