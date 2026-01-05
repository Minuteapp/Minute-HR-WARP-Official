import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, PieChart, TrendingUp, Activity, Target, Clock, FileText, 
  Users, Calendar, Zap, Bell, CheckSquare
} from 'lucide-react';

interface WidgetCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface WidgetType {
  id: string;
  category: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  size?: { w: number; h: number };
}

const widgetCategories: WidgetCategory[] = [
  { id: 'kpi', name: 'KPI & Metriken', icon: BarChart3, color: 'bg-blue-500' },
  { id: 'charts', name: 'Charts & Grafiken', icon: PieChart, color: 'bg-green-500' },
  { id: 'lists', name: 'Listen & Tabellen', icon: FileText, color: 'bg-orange-500' },
  { id: 'calendar', name: 'Kalender & Zeit', icon: Calendar, color: 'bg-purple-500' },
  { id: 'actions', name: 'Schnellaktionen', icon: Zap, color: 'bg-yellow-500' },
  { id: 'hr', name: 'HR-Module', icon: Users, color: 'bg-pink-500' }
];

const defaultWidgets: WidgetType[] = [
  // KPI Widgets
  { id: 'kpi_card', category: 'kpi', name: 'KPI Karte', icon: TrendingUp, description: 'Einzelne Kennzahl mit Trend', size: { w: 1, h: 1 } },
  { id: 'progress_ring', category: 'kpi', name: 'Fortschrittsring', icon: Activity, description: 'Kreisförmiger Fortschritt', size: { w: 1, h: 1 } },
  
  // Chart Widgets
  { id: 'bar_chart', category: 'charts', name: 'Balkendiagramm', icon: BarChart3, description: 'Vergleich von Werten', size: { w: 2, h: 2 } },
  { id: 'line_chart', category: 'charts', name: 'Liniendiagramm', icon: TrendingUp, description: 'Trends über Zeit', size: { w: 2, h: 2 } },
  
  // Listen Widgets
  { id: 'list_compact', category: 'lists', name: 'Kompakte Liste', icon: FileText, description: 'Kurze Elementliste', size: { w: 2, h: 2 } },
  { id: 'team_status', category: 'lists', name: 'Team-Status', icon: Users, description: 'Überblick Teammitglieder', size: { w: 2, h: 2 } },
  
  // Kalender & Zeit
  { id: 'calendar_summary', category: 'calendar', name: 'Kalender-Übersicht', icon: Calendar, description: 'Kommende Termine', size: { w: 2, h: 2 } },
  { id: 'time_tracking', category: 'calendar', name: 'Zeiterfassung', icon: Clock, description: 'Live-Timer', size: { w: 2, h: 1 } },
  
  // Aktionen
  { id: 'quick_actions', category: 'actions', name: 'Schnellaktionen', icon: Zap, description: 'Wichtige Aktionen', size: { w: 2, h: 1 } },
  
  // HR Module
  { id: 'notification_feed', category: 'hr', name: 'Benachrichtigungen', icon: Bell, description: 'Aktuelle Mitteilungen', size: { w: 2, h: 2 } },
  { id: 'favorites', category: 'hr', name: 'Favoriten', icon: Target, description: 'Häufig genutzte Funktionen', size: { w: 2, h: 1 } }
];

interface WidgetLibraryProps {
  onWidgetSelect?: (widget: WidgetType) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  onWidgetSelect,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  const filteredWidgets = selectedCategory === 'all' 
    ? defaultWidgets 
    : defaultWidgets.filter(w => w.category === selectedCategory);

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-2">Widget-Bibliothek</h3>
        <p className="text-sm text-muted-foreground">
          Widgets per Drag & Drop auf Canvas ziehen
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange?.('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Alle Widgets</span>
                <Badge variant="secondary" className="ml-auto">
                  {defaultWidgets.length}
                </Badge>
              </div>
            </button>

            {widgetCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange?.(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{category.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {defaultWidgets.filter(w => w.category === category.id).length}
                  </Badge>
                </div>
              </button>
            ))}
          </div>

          {/* Widgets List */}
          <div className="space-y-2">
            {filteredWidgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <Card
                  key={widget.id}
                  className="cursor-move hover:border-primary transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('widget', JSON.stringify(widget));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => onWidgetSelect?.(widget)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{widget.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {widget.description}
                        </p>
                        {widget.size && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {widget.size.w}x{widget.size.h}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
