import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
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
  Lightbulb,
  Brain,
  BookOpen,
  FileText,
  Settings,
  GripVertical,
  Plus,
  TrendingUp,
  Award,
  MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  type: string;
  category: 'basic' | 'advanced' | 'analytics' | 'actions';
  permissions?: string[];
}

interface ActionDefinition {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  type: string;
  category: 'create' | 'approve' | 'notify' | 'workflow';
}

const availableWidgets: WidgetDefinition[] = [
  // Basic Widgets
  {
    id: 'calendar',
    title: 'Kalender',
    description: 'Termine und Events',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600',
    type: 'calendar',
    category: 'basic'
  },
  {
    id: 'time-tracking',
    title: 'Zeiterfassung',
    description: 'Arbeitszeit tracking',
    icon: Clock,
    color: 'bg-green-50 text-green-600',
    type: 'time',
    category: 'basic'
  },
  {
    id: 'team-status',
    title: 'Team Status',
    description: 'Team Übersicht',
    icon: Users,
    color: 'bg-orange-50 text-orange-600',
    type: 'team',
    category: 'basic'
  },
  {
    id: 'projects',
    title: 'Projekte',
    description: 'Projekt Status',
    icon: FolderOpen,
    color: 'bg-purple-50 text-purple-600',
    type: 'projects',
    category: 'basic'
  },
  {
    id: 'tasks',
    title: 'Aufgaben',
    description: 'Task Management',
    icon: CheckSquare,
    color: 'bg-red-50 text-red-600',
    type: 'tasks',
    category: 'basic'
  },
  {
    id: 'search',
    title: 'Suche',
    description: 'Globale Suche',
    icon: Search,
    color: 'bg-gray-50 text-gray-600',
    type: 'search',
    category: 'basic'
  },
  
  // Advanced Widgets
  {
    id: 'goals',
    title: 'Ziele',
    description: 'Ziele & KPIs',
    icon: Target,
    color: 'bg-amber-50 text-amber-600',
    type: 'goals',
    category: 'advanced'
  },
  {
    id: 'expenses',
    title: 'Ausgaben',
    description: 'Spesen & Kosten',
    icon: CreditCard,
    color: 'bg-emerald-50 text-emerald-600',
    type: 'expenses',
    category: 'advanced'
  },
  {
    id: 'approvals',
    title: 'Genehmigungen',
    description: 'Pending Approvals',
    icon: FileCheck,
    color: 'bg-indigo-50 text-indigo-600',
    type: 'approvals',
    category: 'advanced'
  },
  {
    id: 'innovations',
    title: 'Innovationen',
    description: 'Innovation Hub',
    icon: Lightbulb,
    color: 'bg-yellow-50 text-yellow-600',
    type: 'innovations',
    category: 'advanced'
  },
  {
    id: 'ai-module',
    title: 'KI-Modul',
    description: 'AI Assistant',
    icon: Brain,
    color: 'bg-pink-50 text-pink-600',
    type: 'ai',
    category: 'advanced'
  },
  {
    id: 'training',
    title: 'Schulungen',
    description: 'Learning & Development',
    icon: BookOpen,
    color: 'bg-teal-50 text-teal-600',
    type: 'training',
    category: 'advanced'
  },
  {
    id: 'documents',
    title: 'Dokumente',
    description: 'Document Management',
    icon: FileText,
    color: 'bg-slate-50 text-slate-600',
    type: 'documents',
    category: 'advanced'
  },
  
  // Analytics Widgets
  {
    id: 'forecast',
    title: 'Forecast',
    description: 'Prognosen & Trends',
    icon: TrendingUp,
    color: 'bg-cyan-50 text-cyan-600',
    type: 'forecast',
    category: 'analytics'
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Leistungsübersicht',
    icon: BarChart3,
    color: 'bg-violet-50 text-violet-600',
    type: 'performance',
    category: 'analytics'
  },
  {
    id: 'rewards',
    title: 'Benefits',
    description: 'Mitarbeiter Benefits',
    icon: Award,
    color: 'bg-rose-50 text-rose-600',
    type: 'rewards',
    category: 'analytics'
  }
];

const availableActions: ActionDefinition[] = [
  // Create Actions
  {
    id: 'add-employee',
    title: 'Mitarbeiter hinzufügen',
    description: 'Neuen Mitarbeiter anlegen',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    type: 'create-employee',
    category: 'create'
  },
  {
    id: 'create-task',
    title: 'Aufgabe erstellen',
    description: 'Neue Aufgabe hinzufügen',
    icon: Plus,
    color: 'bg-green-50 text-green-600',
    type: 'create-task',
    category: 'create'
  },
  {
    id: 'start-project',
    title: 'Projekt starten',
    description: 'Neues Projekt anlegen',
    icon: FolderOpen,
    color: 'bg-purple-50 text-purple-600',
    type: 'create-project',
    category: 'create'
  },
  
  // Workflow Actions
  {
    id: 'time-entry',
    title: 'Zeit erfassen',
    description: 'Arbeitszeit stempeln',
    icon: Clock,
    color: 'bg-orange-50 text-orange-600',
    type: 'time-entry',
    category: 'workflow'
  },
  {
    id: 'request-approval',
    title: 'Genehmigung anfragen',
    description: 'Approval Request starten',
    icon: FileCheck,
    color: 'bg-amber-50 text-amber-600',
    type: 'request-approval',
    category: 'workflow'
  },
  
  // Notification Actions
  {
    id: 'send-message',
    title: 'Nachricht senden',
    description: 'Team benachrichtigen',
    icon: MessageSquare,
    color: 'bg-indigo-50 text-indigo-600',
    type: 'send-message',
    category: 'notify'
  },
  
  // Settings Actions
  {
    id: 'dashboard-settings',
    title: 'Dashboard Einstellungen',
    description: 'Layout konfigurieren',
    icon: Settings,
    color: 'bg-gray-50 text-gray-600',
    type: 'dashboard-settings',
    category: 'workflow'
  }
];

interface DashboardWidgetSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const DashboardWidgetSidebar = ({ isOpen, onToggle }: DashboardWidgetSidebarProps) => {
  const { startDrag } = useDragAndDrop();

  const handleWidgetDragStart = (widget: WidgetDefinition) => {
    startDrag({
      id: widget.id,
      type: 'widget',
      data: widget
    });
  };

  const handleActionDragStart = (action: ActionDefinition) => {
    startDrag({
      id: action.id,
      type: 'action',
      data: action
    });
  };

  const getWidgetsByCategory = (category: WidgetDefinition['category']) => {
    return availableWidgets.filter(widget => widget.category === category);
  };

  const getActionsByCategory = (category: ActionDefinition['category']) => {
    return availableActions.filter(action => action.category === category);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Dashboard Builder</h3>
        <p className="text-sm text-muted-foreground">Widgets und Aktionen hinzufügen</p>
      </div>

      <Tabs defaultValue="widgets" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="actions">Aktionen</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="flex-1 m-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-6 py-4">
              {/* Basic Widgets */}
              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Basis Widgets</h4>
                <div className="space-y-2">
                  {getWidgetsByCategory('basic').map((widget) => (
                    <Card 
                      key={widget.id}
                      className="p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleWidgetDragStart(widget)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${widget.color}`}>
                          <widget.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{widget.title}</h5>
                          <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Advanced Widgets */}
              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Erweiterte Widgets</h4>
                <div className="space-y-2">
                  {getWidgetsByCategory('advanced').map((widget) => (
                    <Card 
                      key={widget.id}
                      className="p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleWidgetDragStart(widget)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${widget.color}`}>
                          <widget.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{widget.title}</h5>
                          <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Analytics Widgets */}
              <div>
                <h4 className="font-medium text-sm mb-3 text-muted-foreground">Analytics Widgets</h4>
                <div className="space-y-2">
                  {getWidgetsByCategory('analytics').map((widget) => (
                    <Card 
                      key={widget.id}
                      className="p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                      draggable
                      onDragStart={() => handleWidgetDragStart(widget)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${widget.color}`}>
                          <widget.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{widget.title}</h5>
                          <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 m-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-6 py-4">
              {(['create', 'workflow', 'notify'] as const).map(category => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                    {category === 'create' && 'Erstellen'}
                    {category === 'workflow' && 'Workflow'}
                    {category === 'notify' && 'Benachrichtigungen'}
                  </h4>
                  <div className="space-y-2">
                    {getActionsByCategory(category).map((action) => (
                      <Card 
                        key={action.id}
                        className="p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                        draggable
                        onDragStart={() => handleActionDragStart(action)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate">{action.title}</h5>
                            <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};