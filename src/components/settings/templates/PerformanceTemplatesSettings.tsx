
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
  BarChart3, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Users,
  MessageCircle,
  Star,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const performanceTemplates = [
  {
    id: '1',
    name: '360° Feedback Vorlage',
    description: 'Umfassendes Feedback von Vorgesetzten, Kollegen und Mitarbeitern',
    category: 'feedback',
    isActive: true,
    usageCount: 28,
    lastUsed: '2024-01-15',
    fields: ['leadership', 'communication', 'teamwork', 'goal_achievement'],
    evaluationType: '360_feedback',
    ratingScale: '1-5'
  },
  {
    id: '2',
    name: 'Jahresgespräch Standard',
    description: 'Strukturierte Vorlage für jährliche Mitarbeitergespräche',
    category: 'annual_review',
    isActive: true,
    usageCount: 45,
    lastUsed: '2024-01-14',
    fields: ['achievements', 'development_goals', 'career_planning', 'feedback'],
    evaluationType: 'annual_review',
    ratingScale: '1-10'
  },
  {
    id: '3',
    name: 'Selbstbewertung Quartal',
    description: 'Template für quartalsweise Selbstreflexion',
    category: 'self_assessment',
    isActive: true,
    usageCount: 33,
    lastUsed: '2024-01-13',
    fields: ['self_rating', 'accomplishments', 'challenges', 'improvement_areas'],
    evaluationType: 'self_assessment',
    ratingScale: '1-5'
  }
];

export const PerformanceTemplatesSettings = () => {
  const [templates, setTemplates] = useState(performanceTemplates);
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

  const getEvaluationTypeIcon = (type: string) => {
    switch (type) {
      case '360_feedback':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'annual_review':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'self_assessment':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Performance-Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für Bewertungen, Feedback und Jahresgespräche</p>
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
              <DialogTitle>Neues Performance-Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Performance-Bewertungen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. Quartalsbewertung" />
                </div>
                <div>
                  <Label htmlFor="evaluationType">Bewertungstyp</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="360_feedback">360° Feedback</SelectItem>
                      <SelectItem value="annual_review">Jahresgespräch</SelectItem>
                      <SelectItem value="self_assessment">Selbstbewertung</SelectItem>
                      <SelectItem value="peer_review">Peer Review</SelectItem>
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
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="annual_review">Jahresgespräch</SelectItem>
                      <SelectItem value="self_assessment">Selbstbewertung</SelectItem>
                      <SelectItem value="development">Entwicklung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ratingScale">Bewertungsskala</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Skala wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 Sterne</SelectItem>
                      <SelectItem value="1-10">1-10 Punkte</SelectItem>
                      <SelectItem value="percentage">Prozent (0-100%)</SelectItem>
                      <SelectItem value="grade">Schulnoten (1-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Performance-Templates" />
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
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="annual_review">Jahresgespräch</SelectItem>
            <SelectItem value="self_assessment">Selbstbewertung</SelectItem>
            <SelectItem value="development">Entwicklung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getEvaluationTypeIcon(template.evaluationType)}
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
                    Skala: {template.ratingScale}
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
                  <span>{template.fields.length} Bewertungsfelder</span>
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
