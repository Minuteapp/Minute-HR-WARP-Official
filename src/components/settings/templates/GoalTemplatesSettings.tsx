
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
  Target, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const goalTemplates = [
  {
    id: '1',
    name: 'SMART Quartalsziel',
    description: 'Template für spezifische, messbare Quartalsziele',
    category: 'quarterly',
    isActive: true,
    usageCount: 32,
    lastUsed: '2024-01-15',
    fields: ['goal_title', 'target_value', 'measurement', 'deadline'],
    goalType: 'smart',
    targetAudience: ['employee', 'manager']
  },
  {
    id: '2',
    name: 'OKR Unternehmensziel',
    description: 'Objectives & Key Results für Unternehmensziele',
    category: 'company',
    isActive: true,
    usageCount: 18,
    lastUsed: '2024-01-14',
    fields: ['objective', 'key_result_1', 'key_result_2', 'key_result_3'],
    goalType: 'okr',
    targetAudience: ['admin', 'executive']
  },
  {
    id: '3',
    name: 'Team-Performance Ziel',
    description: 'Kollaborative Ziele für Teams',
    category: 'team',
    isActive: true,
    usageCount: 25,
    lastUsed: '2024-01-13',
    fields: ['team_name', 'collective_goal', 'individual_contributions', 'success_metrics'],
    goalType: 'team',
    targetAudience: ['manager', 'team_lead']
  }
];

export const GoalTemplatesSettings = () => {
  const [templates, setTemplates] = useState(goalTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleTemplateStatus = (id: string) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, isActive: !template.isActive } : template
    ));
  };

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

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'smart':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'okr':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'team':
        return <Users className="h-4 w-4 text-purple-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Ziel-Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für SMART-Ziele, OKRs und Team-Ziele</p>
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
              <DialogTitle>Neues Ziel-Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Ziele und Objectives
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. Jahres-OKR Vorlage" />
                </div>
                <div>
                  <Label htmlFor="goalType">Ziel-Typ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smart">SMART-Ziel</SelectItem>
                      <SelectItem value="okr">OKR</SelectItem>
                      <SelectItem value="team">Team-Ziel</SelectItem>
                      <SelectItem value="personal">Persönliches Ziel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quartal</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                    <SelectItem value="company">Unternehmen</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="personal">Persönlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Ziel-Templates" />
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
            <SelectItem value="quarterly">Quartal</SelectItem>
            <SelectItem value="yearly">Jährlich</SelectItem>
            <SelectItem value="company">Unternehmen</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="personal">Persönlich</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getGoalTypeIcon(template.goalType)}
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
                    {template.goalType.toUpperCase()}
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
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{template.targetAudience.join(', ')}</span>
                  </div>
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
