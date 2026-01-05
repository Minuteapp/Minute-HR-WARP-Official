import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Star,
  Layout,
  BarChart3,
  Users,
  Clock,
  Briefcase,
  TrendingUp,
  Plus
} from 'lucide-react';

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Standard' | 'Analytics' | 'Management' | 'Personal';
  widgets: string[];
  layout: any;
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
  usageCount: number;
  preview: string;
}

const predefinedTemplates: DashboardTemplate[] = [
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'Überblick für Führungskräfte mit KPIs und Berichten',
    category: 'Management',
    widgets: ['analytics', 'team-status', 'projects', 'goals', 'forecast'],
    layout: { type: 'grid', config: '4x3' },
    isDefault: true,
    isCustom: false,
    createdAt: '2024-01-15',
    usageCount: 156,
    preview: '📊'
  },
  {
    id: 'employee-standard',
    name: 'Mitarbeiter Standard',
    description: 'Standard-Layout für Mitarbeiter mit den wichtigsten Tools',
    category: 'Standard',
    widgets: ['time-tracking', 'calendar', 'tasks', 'team-status', 'search'],
    layout: { type: 'grid', config: '3x3' },
    isDefault: true,
    isCustom: false,
    createdAt: '2024-01-15',
    usageCount: 1247,
    preview: '👤'
  },
  {
    id: 'analytics-focus',
    name: 'Analytics Focus',
    description: 'Datenorientiertes Dashboard für Analysten',
    category: 'Analytics',
    widgets: ['analytics', 'forecast', 'performance', 'projects', 'reports'],
    layout: { type: 'grid', config: '4x4' },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-02-01',
    usageCount: 89,
    preview: '📈'
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    description: 'Personalmanagement mit Team-Übersicht und Recruiting',
    category: 'Management',
    widgets: ['team-status', 'recruiting', 'performance', 'calendar', 'approvals'],
    layout: { type: 'grid', config: '3x4' },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-02-10',
    usageCount: 67,
    preview: '👥'
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Projektfokussiertes Dashboard mit Tasks und Timeline',
    category: 'Management',
    widgets: ['projects', 'tasks', 'team-status', 'calendar', 'documents'],
    layout: { type: 'grid', config: '4x3' },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-02-15',
    usageCount: 134,
    preview: '🗂️'
  }
];

export const DashboardTemplates = () => {
  const [templates, setTemplates] = useState<DashboardTemplate[]>(predefinedTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const categories = ['Alle', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'Alle' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const applyTemplate = (templateId: string) => {
    console.log('Applying template:', templateId);
    // Here would be the logic to apply the template
  };

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTemplate: DashboardTemplate = {
        ...template,
        id: `${template.id}-copy-${Date.now()}`,
        name: `${template.name} (Kopie)`,
        isCustom: true,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    }
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Management': return Briefcase;
      case 'Analytics': return BarChart3;
      case 'Standard': return Layout;
      case 'Personal': return Users;
      default: return Layout;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Dashboard-Vorlagen</h3>
        <p className="text-sm text-muted-foreground">
          Nutze vordefinierte Templates oder erstelle eigene Dashboard-Layouts
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Template importieren
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Neues Template erstellen
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          
          return (
            <Card key={template.id} className="p-6 space-y-4">
              {/* Template Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">{template.preview}</div>
                    {template.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <Badge 
                    variant={template.category === 'Management' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    <CategoryIcon className="h-3 w-3" />
                    <span>{template.category}</span>
                  </Badge>
                </div>
                
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>

              {/* Template Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Widgets:</span>
                  <span className="font-medium">{template.widgets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verwendet:</span>
                  <span className="font-medium">{template.usageCount}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Erstellt:</span>
                  <span className="font-medium">{template.createdAt}</span>
                </div>
              </div>

              {/* Widget List */}
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Enthaltene Widgets:</span>
                <div className="flex flex-wrap gap-1">
                  {template.widgets.slice(0, 3).map(widget => (
                    <Badge key={widget} variant="outline" className="text-xs">
                      {widget}
                    </Badge>
                  ))}
                  {template.widgets.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.widgets.length - 3} weitere
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => applyTemplate(template.id)}>
                  Anwenden
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => duplicateTemplate(template.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                {template.isCustom && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Template Statistics */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Template Statistiken</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Verfügbare Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {templates.filter(t => t.isCustom).length}
            </div>
            <div className="text-sm text-muted-foreground">Benutzerdefiniert</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Gesamte Nutzung</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(templates.reduce((sum, t) => sum + t.usageCount, 0) / templates.length)}
            </div>
            <div className="text-sm text-muted-foreground">Ø Nutzung</div>
          </div>
        </div>
      </Card>
    </div>
  );
};