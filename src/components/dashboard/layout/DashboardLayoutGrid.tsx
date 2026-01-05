import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TodayEventsWidget, 
  WeekOverviewWidget,
  CurrentStatusWidget,
  WeeklyHoursWidget,
  MyTasksWidget,
  TaskOverviewWidget,
  TeamStatusWidget,
  ProjectStatusWidget,
  BudgetOverviewWidget,
  RecentNotificationsWidget,
  QuickActionsWidget,
  WeatherWidget
} from '../widgets';

interface LayoutGridProps {
  layout: any[];
  className?: string;
}

const DashboardLayoutGrid: React.FC<LayoutGridProps> = ({ layout, className = "" }) => {
  const renderWidget = (container: any) => {
    const { module_name, widget_type } = container;
    
    // Widget-Komponenten-Mapping
    switch (`${module_name}.${widget_type}`) {
      // Calendar Widgets
      case 'calendar.today_events':
        return <TodayEventsWidget />;
      case 'calendar.week_overview':
        return <WeekOverviewWidget />;
      
      // Time Tracking Widgets
      case 'time_tracking.current_status':
        return <CurrentStatusWidget />;
      case 'time_tracking.weekly_hours':
        return <WeeklyHoursWidget />;
      
      // Task Widgets
      case 'tasks.my_tasks':
        return <MyTasksWidget />;
      case 'tasks.task_overview':
        return <TaskOverviewWidget />;
      
      // Team Widgets
      case 'team.team_status':
        return <TeamStatusWidget />;
      
      // Project Widgets
      case 'projects.project_status':
        return <ProjectStatusWidget />;
      
      // Budget Widgets
      case 'budget.budget_overview':
        return <BudgetOverviewWidget />;
      
      // Notification Widgets
      case 'notifications.recent_notifications':
        return <RecentNotificationsWidget />;
      
      // Quick Actions Widget
      case 'quick_actions.main_actions':
        return <QuickActionsWidget 
          widget={{
            id: 'quick-actions',
            widget_type: 'quick_actions',
            title: 'Schnelle Aktionen',
            config: {},
            position_x: 0,
            position_y: 0,
            width: 1,
            height: 1,
            is_active: true,
            visibility_rules: {}
          }}
          data={null}
        />;
      
      // Weather Widget
      case 'weather.current_weather':
        return <WeatherWidget />;
      
      // Fallback für unbekannte Widgets
      default:
        return (
          <Card className="h-full">
            <CardContent className="p-4 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-medium mb-1">
                  {container.display_name || container.widget_type}
                </div>
                <div className="text-xs text-muted-foreground">
                  {container.module_name}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Widget noch nicht implementiert
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={`grid grid-cols-6 gap-4 auto-rows-fr ${className}`}>
      {layout.map((container, index) => (
        <div
          key={container.id || index}
          className="min-h-[120px]"
          style={{
            gridColumn: `span ${container.width || 1}`,
            gridRow: `span ${container.height || 1}`
          }}
        >
          {renderWidget(container)}
        </div>
      ))}
    </div>
  );
};

export default DashboardLayoutGrid;