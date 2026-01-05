
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
  DollarSign, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const budgetTemplates = [
  {
    id: '1',
    name: 'Jahresbudget Standard',
    description: 'Vollständiges Jahresbudget mit allen Kostenstellen',
    category: 'yearly',
    isActive: true,
    usageCount: 15,
    lastUsed: '2024-01-15',
    fields: ['total_budget', 'personnel_costs', 'operational_costs', 'investments'],
    budgetType: 'yearly',
    currency: 'EUR',
    scenarios: ['optimistic', 'realistic', 'pessimistic']
  },
  {
    id: '2',
    name: 'Projektbudget Template',
    description: 'Budget-Vorlage für einzelne Projekte',
    category: 'project',
    isActive: true,
    usageCount: 23,
    lastUsed: '2024-01-14',
    fields: ['project_costs', 'resource_allocation', 'timeline_budget', 'contingency'],
    budgetType: 'project',
    currency: 'EUR',
    scenarios: ['minimal', 'standard', 'extended']
  },
  {
    id: '3',
    name: 'Personalbudget Q1',
    description: 'Quartalsbudget für Personalkosten und Entwicklung',
    category: 'personnel',
    isActive: true,
    usageCount: 18,
    lastUsed: '2024-01-13',
    fields: ['salaries', 'benefits', 'training_budget', 'recruitment_costs'],
    budgetType: 'quarterly',
    currency: 'EUR',
    scenarios: ['conservative', 'growth', 'expansion']
  }
];

export const BudgetTemplatesSettings = () => {
  const [templates, setTemplates] = useState(budgetTemplates);
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

  const getBudgetTypeIcon = (type: string) => {
    switch (type) {
      case 'yearly':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'project':
        return <BarChart3 className="h-4 w-4 text-green-600" />;
      case 'quarterly':
        return <PieChart className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Budget-Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für Budgets, Forecasts und Finanzplanung</p>
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
              <DialogTitle>Neues Budget-Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Budgets und Finanzplanung
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. Abteilungsbudget 2024" />
                </div>
                <div>
                  <Label htmlFor="budgetType">Budget-Typ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="project">Projekt</SelectItem>
                      <SelectItem value="department">Abteilung</SelectItem>
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
                      <SelectItem value="yearly">Jahresbudget</SelectItem>
                      <SelectItem value="project">Projekt</SelectItem>
                      <SelectItem value="personnel">Personal</SelectItem>
                      <SelectItem value="operational">Betrieb</SelectItem>
                      <SelectItem value="investment">Investition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Währung</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Währung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Budget-Templates" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="scenarios" />
                <Label htmlFor="scenarios">Mehrere Szenarien (Optimistisch/Realistisch/Pessimistisch)</Label>
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
            <SelectItem value="yearly">Jahresbudget</SelectItem>
            <SelectItem value="project">Projekt</SelectItem>
            <SelectItem value="personnel">Personal</SelectItem>
            <SelectItem value="operational">Betrieb</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getBudgetTypeIcon(template.budgetType)}
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
                    {template.currency}
                  </Badge>
                  <Badge variant="outline">
                    {template.scenarios.length} Szenarien
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
                  <span>{template.fields.length} Budget-Kategorien</span>
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
