import React, { useEffect, useState } from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { DashboardService } from '@/services/dashboardService';
import { supabase } from '@/integrations/supabase/client';
import MobileKPIWidget from './widgets/MobileKPIWidget';
import MobileTeamWidget from './widgets/MobileTeamWidget';
import MobileListWidget from './widgets/MobileListWidget';
import MobileGoalsWidget from './widgets/MobileGoalsWidget';
import { Loader2 } from 'lucide-react';

interface WidgetWithData {
  widget: DashboardWidget;
  data: WidgetData;
}

const DynamicMobileWidgetGrid: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('employee');

  useEffect(() => {
    initializeWidgets();
  }, []);

  // Live-Updates für Zeiterfassung
  useEffect(() => {
    if (!userId) return;

    const timeChannel = supabase
      .channel('mobile-dashboard-time')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_entries'
      }, () => {
        refreshWidgetData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(timeChannel);
    };
  }, [userId]);

  // Live-Updates für Kalender
  useEffect(() => {
    if (!userId) return;

    const calendarChannel = supabase
      .channel('mobile-dashboard-calendar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events'
      }, () => {
        refreshWidgetData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(calendarChannel);
    };
  }, [userId]);

  // Live-Updates für Tasks
  useEffect(() => {
    if (!userId) return;

    const tasksChannel = supabase
      .channel('mobile-dashboard-tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        refreshWidgetData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [userId]);

  // Auto-Refresh alle 30 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWidgetData();
    }, 30000);

    return () => clearInterval(interval);
  }, [widgets]);

  const initializeWidgets = async () => {
    try {
      setLoading(true);
      
      // Hole aktuellen User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUserId(user.id);

      // Hole Mobile-Widgets
      const mobileWidgets = await DashboardService.getMobileWidgets(user.id, userRole);
      
      // Lade Daten für jedes Widget
      const widgetsWithData = await Promise.all(
        mobileWidgets.map(async (widget) => {
          const data = await DashboardService.getWidgetData(widget, userRole);
          return { widget, data };
        })
      );

      setWidgets(widgetsWithData);
    } catch (error) {
      console.error('Fehler beim Laden der Widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWidgetData = async () => {
    if (widgets.length === 0) return;

    try {
      const updatedWidgets = await Promise.all(
        widgets.map(async ({ widget }) => {
          const data = await DashboardService.getWidgetData(widget, userRole);
          return { widget, data };
        })
      );

      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Widget-Daten:', error);
    }
  };

  const renderWidget = (widgetWithData: WidgetWithData) => {
    const { widget, data } = widgetWithData;

    switch (widget.widget_type) {
      case 'kpi_card':
        return <MobileKPIWidget widget={widget} data={data} />;
      case 'team_status':
        return <MobileTeamWidget widget={widget} data={data} />;
      case 'list_compact':
        return <MobileListWidget widget={widget} data={data} />;
      case 'progress_ring':
        return <MobileGoalsWidget widget={widget} data={data} />;
      default:
        return <MobileKPIWidget widget={widget} data={data} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2c3ad1]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {widgets.map((widgetWithData) => (
        <div key={widgetWithData.widget.id}>
          {renderWidget(widgetWithData)}
        </div>
      ))}
    </div>
  );
};

export default DynamicMobileWidgetGrid;
