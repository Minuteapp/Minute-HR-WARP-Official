import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Search,
  BarChart3,
  Target,
  CreditCard,
  FileCheck,
  Settings,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  enabled: boolean;
  permissions: string[];
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    defaultSize: string;
    allowResize: boolean;
  };
}

const availableWidgets: Widget[] = [
  {
    id: 'calendar',
    title: 'Kalender',
    description: 'Termine und Events anzeigen',
    icon: Calendar,
    category: 'Basis',
    enabled: true,
    permissions: ['VIEW_CALENDAR'],
    settings: {
      autoRefresh: true,
      refreshInterval: 15,
      defaultSize: 'medium',
      allowResize: true
    }
  },
  {
    id: 'time-tracking',
    title: 'Zeiterfassung',
    description: 'Arbeitszeit tracking und Stempeluhr',
    icon: Clock,
    category: 'Basis',
    enabled: true,
    permissions: ['VIEW_TIME_TRACKING'],
    settings: {
      autoRefresh: true,
      refreshInterval: 5,
      defaultSize: 'small',
      allowResize: false
    }
  },
  {
    id: 'team-status',
    title: 'Team Status',
    description: 'Übersicht über Team-Mitglieder',
    icon: Users,
    category: 'Team',
    enabled: true,
    permissions: ['VIEW_TEAM'],
    settings: {
      autoRefresh: true,
      refreshInterval: 10,
      defaultSize: 'large',
      allowResize: true
    }
  },
  {
    id: 'projects',
    title: 'Projekte',
    description: 'Projekt Status und Fortschritt',
    icon: FolderOpen,
    category: 'Projekte',
    enabled: false,
    permissions: ['VIEW_PROJECTS'],
    settings: {
      autoRefresh: true,
      refreshInterval: 30,
      defaultSize: 'medium',
      allowResize: true
    }
  },
  {
    id: 'tasks',
    title: 'Aufgaben',
    description: 'Task Management und To-Dos',
    icon: CheckSquare,
    category: 'Produktivität',
    enabled: true,
    permissions: ['VIEW_TASKS'],
    settings: {
      autoRefresh: true,
      refreshInterval: 15,
      defaultSize: 'medium',
      allowResize: true
    }
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Datenauswertungen und Statistiken',
    icon: BarChart3,
    category: 'Analytics',
    enabled: false,
    permissions: ['VIEW_ANALYTICS'],
    settings: {
      autoRefresh: false,
      refreshInterval: 60,
      defaultSize: 'large',
      allowResize: true
    }
  }
];

export const WidgetManagement = () => {
  const [widgets, setWidgets] = useState<Widget[]>(availableWidgets);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const categories = ['Alle', ...Array.from(new Set(widgets.map(w => w.category)))];

  const filteredWidgets = selectedCategory === 'Alle' 
    ? widgets 
    : widgets.filter(w => w.category === selectedCategory);

  const toggleWidget = (widgetId: string) => {
    setWidgets(widgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, enabled: !widget.enabled }
        : widget
    ));
  };

  const updateWidgetSetting = (widgetId: string, settingKey: string, value: any) => {
    setWidgets(widgets.map(widget => 
      widget.id === widgetId 
        ? { 
            ...widget, 
            settings: { 
              ...widget.settings, 
              [settingKey]: value 
            } 
          }
        : widget
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Widget-Verwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Verwalte verfügbare Widgets und deren Einstellungen für das Dashboard
        </p>
      </div>

      {/* Category Filter */}
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

      {/* Widgets Grid */}
      <div className="space-y-4">
        {filteredWidgets.map((widget) => (
          <Card key={widget.id} className="p-6">
            <div className="space-y-4">
              {/* Widget Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <widget.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{widget.title}</h4>
                      <Badge variant={widget.enabled ? "default" : "secondary"}>
                        {widget.enabled ? "Aktiv" : "Deaktiviert"}
                      </Badge>
                      <Badge variant="outline">{widget.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
                  </div>
                </div>
                <Switch
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>

              {/* Widget Settings */}
              {widget.enabled && (
                <div className="pl-14 space-y-4 border-l-2 border-muted">
                  <h5 className="font-medium text-sm flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Widget Einstellungen
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auto Refresh */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Auto-Aktualisierung</span>
                        <p className="text-xs text-muted-foreground">
                          Widget automatisch aktualisieren
                        </p>
                      </div>
                      <Switch
                        checked={widget.settings.autoRefresh}
                        onCheckedChange={(value) => 
                          updateWidgetSetting(widget.id, 'autoRefresh', value)
                        }
                      />
                    </div>

                    {/* Refresh Interval */}
                    {widget.settings.autoRefresh && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">Intervall</span>
                          <p className="text-xs text-muted-foreground">
                            Aktualisierung alle {widget.settings.refreshInterval} Min.
                          </p>
                        </div>
                        <select 
                          className="px-2 py-1 text-sm border rounded"
                          value={widget.settings.refreshInterval}
                          onChange={(e) => 
                            updateWidgetSetting(widget.id, 'refreshInterval', parseInt(e.target.value))
                          }
                        >
                          <option value={5}>5 Min</option>
                          <option value={10}>10 Min</option>
                          <option value={15}>15 Min</option>
                          <option value={30}>30 Min</option>
                          <option value={60}>60 Min</option>
                        </select>
                      </div>
                    )}

                    {/* Default Size */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Standard-Größe</span>
                        <p className="text-xs text-muted-foreground">
                          Initiale Widget-Größe
                        </p>
                      </div>
                      <select 
                        className="px-2 py-1 text-sm border rounded"
                        value={widget.settings.defaultSize}
                        onChange={(e) => 
                          updateWidgetSetting(widget.id, 'defaultSize', e.target.value)
                        }
                      >
                        <option value="small">Klein</option>
                        <option value="medium">Mittel</option>
                        <option value="large">Groß</option>
                        <option value="wide">Breit</option>
                      </select>
                    </div>

                    {/* Allow Resize */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Größenänderung erlauben</span>
                        <p className="text-xs text-muted-foreground">
                          Benutzer kann Widget resizen
                        </p>
                      </div>
                      <Switch
                        checked={widget.settings.allowResize}
                        onCheckedChange={(value) => 
                          updateWidgetSetting(widget.id, 'allowResize', value)
                        }
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <span className="text-sm font-medium">Erforderliche Berechtigungen:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {widget.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>
              <strong>{widgets.filter(w => w.enabled).length}</strong> von{' '}
              <strong>{widgets.length}</strong> Widgets aktiv
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Alle Einstellungen speichern
          </Button>
        </div>
      </Card>
    </div>
  );
};