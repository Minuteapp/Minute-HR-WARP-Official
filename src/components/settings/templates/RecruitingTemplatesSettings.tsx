
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
  UserPlus, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  MessageSquare,
  CheckSquare,
  Star,
  Mail
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const recruitingTemplates = [
  {
    id: '1',
    name: 'Interviewleitfaden Senior Developer',
    description: 'Strukturierter Ablauf für technische Interviews',
    category: 'interview',
    isActive: true,
    usageCount: 23,
    lastUsed: '2024-01-15',
    fields: ['technical_skills', 'problem_solving', 'communication', 'culture_fit'],
    recruitingType: 'interview_guide',
    position: 'Senior Developer',
    duration: '60 min'
  },
  {
    id: '2',
    name: 'Bewertungsmatrix Kandidaten',
    description: 'Scorecard für einheitliche Kandidatenbewertung',
    category: 'assessment',
    isActive: true,
    usageCount: 45,
    lastUsed: '2024-01-14',
    fields: ['qualifications', 'experience', 'soft_skills', 'motivation'],
    recruitingType: 'scorecard',
    position: 'Alle Positionen',
    duration: '15 min'
  },
  {
    id: '3',
    name: 'Onboarding Checkliste IT',
    description: 'Vollständige Checkliste für neue IT-Mitarbeiter',
    category: 'onboarding',
    isActive: true,
    usageCount: 18,
    lastUsed: '2024-01-13',
    fields: ['equipment_setup', 'access_rights', 'training_schedule', 'mentor_assignment'],
    recruitingType: 'checklist',
    position: 'IT-Positionen',
    duration: '2 Wochen'
  }
];

export const RecruitingTemplatesSettings = () => {
  const [templates, setTemplates] = useState(recruitingTemplates);
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

  const getRecruitingTypeIcon = (type: string) => {
    switch (type) {
      case 'interview_guide':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'scorecard':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'checklist':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'email_template':
        return <Mail className="h-4 w-4 text-purple-600" />;
      default:
        return <UserPlus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Recruiting & Onboarding Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für Interviews, Bewertungen und Onboarding-Prozesse</p>
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
              <DialogTitle>Neues Recruiting-Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Recruiting und Onboarding
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. Interview Marketing Manager" />
                </div>
                <div>
                  <Label htmlFor="recruitingType">Template-Typ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interview_guide">Interviewleitfaden</SelectItem>
                      <SelectItem value="scorecard">Bewertungsmatrix</SelectItem>
                      <SelectItem value="checklist">Checkliste</SelectItem>
                      <SelectItem value="email_template">E-Mail Vorlage</SelectItem>
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
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="assessment">Bewertung</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="communication">Kommunikation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position/Bereich</Label>
                  <Input id="position" placeholder="z.B. Entwickler, Marketing" />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Geschätzte Dauer</Label>
                <Input id="duration" placeholder="z.B. 45 min, 2 Wochen" />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Recruiting-Templates" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="structured" />
                <Label htmlFor="structured">Strukturierte Bewertung mit Punkten</Label>
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
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="assessment">Bewertung</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="communication">Kommunikation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getRecruitingTypeIcon(template.recruitingType)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Badge variant="outline">
                    {template.position}
                  </Badge>
                  <Badge variant="outline">
                    {template.duration}
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
                  <span>{template.fields.length} Bewertungskriterien</span>
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
