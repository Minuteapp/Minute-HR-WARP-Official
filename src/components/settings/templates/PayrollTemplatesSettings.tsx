
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
  TrendingUp, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  DollarSign,
  Percent,
  Clock,
  Award
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const payrollTemplates = [
  {
    id: '1',
    name: 'Bonus-Matrix Standard',
    description: 'Performance-basierte Bonusberechnung mit verschiedenen Stufen',
    category: 'bonus',
    isActive: true,
    usageCount: 34,
    lastUsed: '2024-01-15',
    fields: ['performance_rating', 'base_salary', 'bonus_percentage', 'individual_goals'],
    payrollType: 'bonus',
    calculationType: 'percentage',
    currency: 'EUR'
  },
  {
    id: '2',
    name: 'Nachtarbeit Zuschläge',
    description: 'Automatische Berechnung von Nachtarbeitszuschlägen',
    category: 'allowances',
    isActive: true,
    usageCount: 28,
    lastUsed: '2024-01-14',
    fields: ['night_hours', 'base_hourly_rate', 'night_premium', 'overtime_factor'],
    payrollType: 'allowances',
    calculationType: 'hourly',
    currency: 'EUR'
  },
  {
    id: '3',
    name: 'Vergütungsband Entwickler',
    description: 'Gehaltsbänder für verschiedene Entwickler-Levels',
    category: 'salary_bands',
    isActive: true,
    usageCount: 12,
    lastUsed: '2024-01-13',
    fields: ['experience_level', 'skill_rating', 'market_adjustment', 'location_factor'],
    payrollType: 'salary_bands',
    calculationType: 'fixed',
    currency: 'EUR'
  }
];

export const PayrollTemplatesSettings = () => {
  const [templates, setTemplates] = useState(payrollTemplates);
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

  const getPayrollTypeIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'allowances':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'salary_bands':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCalculationTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-3 w-3" />;
      case 'hourly':
        return <Clock className="h-3 w-3" />;
      case 'fixed':
        return <DollarSign className="h-3 w-3" />;
      default:
        return <DollarSign className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Lohn & Gehalt Templates</h3>
          <p className="text-gray-600">Verwalten Sie Vorlagen für Bonusregelungen, Zuschläge und Vergütungsbänder</p>
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
              <DialogTitle>Neues Lohn & Gehalt Template erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Vorlage für Vergütungsstrukturen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template-Name</Label>
                  <Input id="name" placeholder="z.B. Quartalsboni IT-Abteilung" />
                </div>
                <div>
                  <Label htmlFor="payrollType">Vergütungstyp</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bonus/Prämie</SelectItem>
                      <SelectItem value="allowances">Zuschläge</SelectItem>
                      <SelectItem value="salary_bands">Vergütungsbänder</SelectItem>
                      <SelectItem value="commission">Provision</SelectItem>
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
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="allowances">Zuschläge</SelectItem>
                      <SelectItem value="salary_bands">Gehaltsbänder</SelectItem>
                      <SelectItem value="benefits">Zusatzleistungen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calculationType">Berechnungsart</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Berechnung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Prozentual</SelectItem>
                      <SelectItem value="fixed">Festbetrag</SelectItem>
                      <SelectItem value="hourly">Stündlich</SelectItem>
                      <SelectItem value="performance">Performance-basiert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" placeholder="Beschreibung des Vergütungs-Templates" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="automatic" />
                <Label htmlFor="automatic">Automatische Berechnung aktivieren</Label>
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
            <SelectItem value="bonus">Bonus</SelectItem>
            <SelectItem value="allowances">Zuschläge</SelectItem>
            <SelectItem value="salary_bands">Gehaltsbänder</SelectItem>
            <SelectItem value="benefits">Zusatzleistungen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getPayrollTypeIcon(template.payrollType)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getCalculationTypeIcon(template.calculationType)}
                    {template.calculationType}
                  </Badge>
                  <Badge variant="outline">
                    {template.currency}
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
                  <span>{template.fields.length} Berechnungsfelder</span>
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
