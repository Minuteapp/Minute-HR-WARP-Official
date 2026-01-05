import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Users,
  Calendar,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Bell,
  Star,
  Target,
  Briefcase,
  FileText,
  MessageSquare,
  Activity,
  PieChart,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetDefinition {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  defaultSize: 'small' | 'medium' | 'large';
}

const widgetDefinitions: WidgetDefinition[] = [
  // Zeit & Anwesenheit
  { id: 'time-tracking', type: 'time_tracking', title: 'Zeiterfassung', description: 'Aktuelle Arbeitszeit', icon: <Clock className="h-5 w-5" />, category: 'Zeit', defaultSize: 'medium' },
  { id: 'calendar', type: 'calendar', title: 'Kalender', description: 'Termine & Events', icon: <Calendar className="h-5 w-5" />, category: 'Zeit', defaultSize: 'large' },
  
  // Team
  { id: 'team-status', type: 'team_status', title: 'Team Status', description: 'Anwesenheit im Team', icon: <Users className="h-5 w-5" />, category: 'Team', defaultSize: 'medium' },
  { id: 'notifications', type: 'notifications', title: 'Benachrichtigungen', description: 'Aktuelle Meldungen', icon: <Bell className="h-5 w-5" />, category: 'Team', defaultSize: 'medium' },
  
  // Aufgaben
  { id: 'tasks', type: 'tasks', title: 'Aufgaben', description: 'Offene Tasks', icon: <CheckSquare className="h-5 w-5" />, category: 'Aufgaben', defaultSize: 'medium' },
  { id: 'goals', type: 'goals', title: 'Ziele', description: 'Persönliche Ziele', icon: <Target className="h-5 w-5" />, category: 'Aufgaben', defaultSize: 'small' },
  
  // Analytics
  { id: 'kpi-card', type: 'kpi_card', title: 'KPI Karte', description: 'Kennzahlen anzeigen', icon: <TrendingUp className="h-5 w-5" />, category: 'Analytics', defaultSize: 'small' },
  { id: 'bar-chart', type: 'bar_chart', title: 'Balkendiagramm', description: 'Daten visualisieren', icon: <BarChart3 className="h-5 w-5" />, category: 'Analytics', defaultSize: 'large' },
  { id: 'progress-ring', type: 'progress_ring', title: 'Fortschrittsring', description: 'Ziel-Fortschritt', icon: <PieChart className="h-5 w-5" />, category: 'Analytics', defaultSize: 'small' },
  
  // Module
  { id: 'recruiting', type: 'recruiting', title: 'Recruiting', description: 'Offene Stellen', icon: <Briefcase className="h-5 w-5" />, category: 'Module', defaultSize: 'medium' },
  { id: 'documents', type: 'documents', title: 'Dokumente', description: 'Letzte Dateien', icon: <FileText className="h-5 w-5" />, category: 'Module', defaultSize: 'medium' },
  { id: 'activity', type: 'activity', title: 'Aktivität', description: 'Letzte Aktivitäten', icon: <Activity className="h-5 w-5" />, category: 'Module', defaultSize: 'medium' },
  
  // Sonstiges
  { id: 'favorites', type: 'favorites', title: 'Favoriten', description: 'Schnellzugriff', icon: <Star className="h-5 w-5" />, category: 'Sonstiges', defaultSize: 'small' },
  { id: 'quick-actions', type: 'quick_actions', title: 'Schnellaktionen', description: 'Häufige Aktionen', icon: <Zap className="h-5 w-5" />, category: 'Sonstiges', defaultSize: 'small' },
  { id: 'messages', type: 'messages', title: 'Nachrichten', description: 'Ungelesene Nachrichten', icon: <MessageSquare className="h-5 w-5" />, category: 'Sonstiges', defaultSize: 'medium' },
];

const categories = ['Zeit', 'Team', 'Aufgaben', 'Analytics', 'Module', 'Sonstiges'];

interface WidgetPaletteProps {
  onWidgetAdd: (widget: WidgetDefinition) => void;
  addedWidgetIds: string[];
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({
  onWidgetAdd,
  addedWidgetIds,
}) => {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Widget-Palette</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Klicke um Widgets hinzuzufügen
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {categories.map((category) => {
            const categoryWidgets = widgetDefinitions.filter(w => w.category === category);
            if (categoryWidgets.length === 0) return null;
            
            return (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  {category}
                </h4>
                <div className="space-y-1">
                  {categoryWidgets.map((widget) => {
                    const isAdded = addedWidgetIds.includes(widget.id);
                    
                    return (
                      <Card
                        key={widget.id}
                        className={cn(
                          'p-2 cursor-pointer transition-all hover:shadow-md',
                          isAdded 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'hover:bg-accent'
                        )}
                        onClick={() => !isAdded && onWidgetAdd(widget)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'p-1.5 rounded',
                            isAdded ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                          )}>
                            {widget.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{widget.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{widget.description}</p>
                          </div>
                          {isAdded && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export { widgetDefinitions };
export type { WidgetDefinition };
