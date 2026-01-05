import React, { useState, useEffect } from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { DashboardService } from '@/services/dashboardService';
import { KPICardWidget } from './KPICardWidget';
import { ListCompactWidget } from './ListCompactWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { TeamStatusWidget } from './TeamStatusWidget';
import { CalendarSummaryWidget } from './CalendarSummaryWidget';
import { Loader2, AlertCircle } from 'lucide-react';

interface WidgetRendererProps {
  widget: DashboardWidget;
  userRole: string;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, userRole }) => {
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWidgetData();
  }, [widget, userRole]);

  const loadWidgetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const widgetData = await DashboardService.getWidgetData(widget, userRole);
      
      if (widgetData.error) {
        setError(widgetData.error);
      } else {
        setData(widgetData);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Widget-Daten:', err);
      setError('Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <div>
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const renderWidget = () => {
    switch (widget.widget_type) {
      case 'kpi_card':
        return <KPICardWidget widget={widget} data={data} />;
      
      case 'list_compact':
        return <ListCompactWidget widget={widget} data={data} />;
      
      case 'quick_actions':
        return <QuickActionsWidget widget={widget} data={data} />;
      
      case 'team_status':
        return <TeamStatusWidget widget={widget} data={data} />;
      
      case 'calendar_summary':
        return <CalendarSummaryWidget widget={widget} data={data} />;
      
      default:
        return (
          <div className="flex items-center justify-center h-full p-4">
            <p className="text-sm text-muted-foreground">
              Unbekannter Widget-Typ: {widget.widget_type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      {renderWidget()}
    </div>
  );
};