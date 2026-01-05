import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Plus,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import type { ExecutiveKPIWidget } from '@/types/budgetExecutive';

interface ExecutiveKPIContainerProps {
  widgets: ExecutiveKPIWidget[];
}

export const ExecutiveKPIContainer = ({ widgets }: ExecutiveKPIContainerProps) => {
  const [visibleWidgets, setVisibleWidgets] = useState<Record<string, boolean>>(
    widgets.reduce((acc, widget) => ({ ...acc, [widget.id]: true }), {})
  );

  const formatValue = (value: number, format?: 'currency' | 'percentage' | 'number') => {
    switch (format) {
      case 'currency':
        return value >= 1000000 
          ? `€${(value / 1000000).toFixed(1)}M`
          : value >= 1000 
          ? `€${(value / 1000).toFixed(0)}K`
          : `€${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { direction: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  };

  const getKPIIcon = (kpiType: ExecutiveKPIWidget['kpi_type']) => {
    // Wird durch die entsprechenden Icons ersetzt basierend auf dem KPI-Typ
    return null;
  };

  const getTargetProgress = (current: number, target?: number) => {
    if (!target) return null;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setVisibleWidgets(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  if (widgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine KPIs konfiguriert</h3>
          <p className="text-muted-foreground text-center mb-4">
            Fügen Sie KPI-Widgets hinzu, um wichtige Kennzahlen im Blick zu behalten.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            KPI hinzufügen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Executive KPIs</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Konfigurieren
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            KPI hinzufügen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets
          .filter(widget => widget.is_active)
          .sort((a, b) => a.dashboard_position - b.dashboard_position)
          .map((widget) => {
            const trend = calculateTrend(widget.current_value, widget.previous_value);
            const targetProgress = getTargetProgress(widget.current_value, widget.target_value);
            const isVisible = visibleWidgets[widget.id];

            return (
              <Card key={widget.id} className={`transition-all duration-200 ${!isVisible ? 'opacity-50' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-sm font-medium">{widget.kpi_name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {widget.period_type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                    >
                      {isVisible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Hauptwert */}
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold" style={{ color: widget.display_config.color || 'inherit' }}>
                      {formatValue(widget.current_value, widget.display_config.format)}
                    </div>
                    
                    {/* Trend-Indikator */}
                    {widget.display_config.showTrend && trend.direction !== 'neutral' && (
                      <div className="flex items-center">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${
                          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend.percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vorperioden-Vergleich */}
                  <div className="text-xs text-muted-foreground">
                    Vorperiode: {formatValue(widget.previous_value, widget.display_config.format)}
                  </div>

                  {/* Target Progress */}
                  {widget.display_config.showTarget && widget.target_value && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Ziel: {formatValue(widget.target_value, widget.display_config.format)}</span>
                        <span>{targetProgress?.toFixed(0)}%</span>
                      </div>
                      <Progress value={targetProgress || 0} className="h-2" />
                    </div>
                  )}

                  {/* KPI-spezifische Zusatzinfos */}
                  {widget.kpi_type === 'cost_ratio' && widget.target_value && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Status:</span>
                      <Badge variant={widget.current_value <= widget.target_value ? 'default' : 'destructive'}>
                        {widget.current_value <= widget.target_value ? 'Im Ziel' : 'Über Ziel'}
                      </Badge>
                    </div>
                  )}

                  {widget.kpi_type === 'growth' && (
                    <div className="text-xs text-muted-foreground">
                      {widget.period_type === 'yearly' ? 'YoY' : widget.period_type === 'monthly' ? 'MoM' : 'QoQ'} Wachstum
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Target className="h-3 w-3 mr-1" />
              Ziele anpassen
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trend-Analyse
            </Button>
            <Button variant="outline" size="sm">
              📊 Dashboard Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};