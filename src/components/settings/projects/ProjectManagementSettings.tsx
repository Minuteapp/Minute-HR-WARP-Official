
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Target, 
  Workflow, 
  DollarSign, 
  Smartphone,
  Settings,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectManagementSettings = () => {
  const projectModules = [
    {
      id: 'project-settings',
      title: 'Projekteinstellungen',
      description: 'Grundlegende Projektparameter und Standardwerte konfigurieren',
      icon: Settings,
      status: 'active',
      path: '/settings/projects?subcategory=project-settings'
    },
    {
      id: 'portfolio',
      title: 'Portfolio-Dashboard',
      description: 'Übergreifende Projektansicht mit Key Metrics und Analysen',
      icon: BarChart3,
      status: 'active',
      path: '/settings/projects?subcategory=portfolio'
    },
    {
      id: 'workflows',
      title: 'Automatisierte Workflows',
      description: 'Trigger-basierte Automatisierung für Projektprozesse',
      icon: Workflow,
      status: 'active',
      path: '/settings/projects?subcategory=workflows'
    },
    {
      id: 'budget-forecast',
      title: 'Budget-Forecasting',
      description: 'Erweiterte Budgetprognosen und Finanzanalysen',
      icon: DollarSign,
      status: 'active',
      path: '/settings/projects?subcategory=budget-forecast'
    },
    {
      id: 'mobile-optimization',
      title: 'Mobile Optimierung',
      description: 'Mobile-spezifische Einstellungen und UI-Konfiguration',
      icon: Smartphone,
      status: 'active',
      path: '/settings/projects?subcategory=mobile-optimization'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'beta': return 'bg-blue-100 text-blue-700';
      case 'planned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FolderOpen className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Projektmanagement Einstellungen</h2>
        <p className="text-muted-foreground mt-2">
          Verwalten Sie alle Aspekte Ihres Projektmanagements von Performance bis Automatisierung
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status === 'active' ? 'Aktiv' : 
                         module.status === 'beta' ? 'Beta' : 'Geplant'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                <Link to={module.path}>
                  <Button className="w-full">
                    Konfigurieren
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktuelle Implementierungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Performance-Optimierungen</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• useOptimizedProjects Hook mit Memoization</li>
                  <li>• React.memo für ProjectCard-Komponenten</li>
                  <li>• useCallback für Event-Handler</li>
                  <li>• Optimierte Queries mit Caching</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Mobile Optimierungen</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• MobileProjectDashboard</li>
                  <li>• Touch-optimierte Interfaces</li>
                  <li>• Responsive Statistiken</li>
                  <li>• Mobile-first Design</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">Portfolio-Dashboard</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Key Metrics Übersicht</li>
                  <li>• Budget-Tracking</li>
                  <li>• Health-Monitoring</li>
                  <li>• Timeline-Ansicht</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-2">Automatisierung & Forecasting</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Trigger-basierte Workflows</li>
                  <li>• Budget-Prognosen</li>
                  <li>• Automatische Benachrichtigungen</li>
                  <li>• Performance-Tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectManagementSettings;

