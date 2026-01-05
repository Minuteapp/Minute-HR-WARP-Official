import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar, FileText, UserPlus, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

interface QuickActionsWidgetProps {
  widget: DashboardWidget;
  data: WidgetData | null;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ widget, data }) => {
  const navigate = useNavigate();

  // Use data.actions if available, otherwise fallback to default actions
  const defaultActions: QuickAction[] = [
    {
      id: 'new-task',
      label: 'Neue Aufgabe',
      icon: <Plus className="h-4 w-4" />,
      route: '/tasks/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'time-entry',
      label: 'Zeit erfassen',
      icon: <Clock className="h-4 w-4" />,
      route: '/time-tracking',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'new-event',
      label: 'Termin erstellen',
      icon: <Calendar className="h-4 w-4" />,
      route: '/calendar/new',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'absence-request',
      label: 'Abwesenheit',
      icon: <FileText className="h-4 w-4" />,
      route: '/absence/new',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'new-project',
      label: 'Projekt starten',
      icon: <UserPlus className="h-4 w-4" />,
      route: '/projects/new',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'expense',
      label: 'Ausgabe erfassen',
      icon: <DollarSign className="h-4 w-4" />,
      route: '/budget/expenses/new',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  // Convert data actions to the local format or use default actions
  const quickActions: QuickAction[] = data?.actions ? 
    data.actions.map((action, index) => ({
      id: `action-${index}`,
      label: action.label,
      icon: <Plus className="h-4 w-4" />,
      route: action.route || '#',
      color: 'bg-primary hover:bg-primary/90'
    })) : defaultActions;

  const handleActionClick = (route: string) => {
    // Prüfe ob Route existiert, falls nicht navigiere zur entsprechenden Hauptseite
    const mainRoutes: { [key: string]: string } = {
      '/tasks/new': '/tasks',
      '/time-tracking': '/time-tracking',
      '/calendar/new': '/calendar',
      '/absence/new': '/absence',
      '/projects/new': '/projects',
      '/budget/expenses/new': '/budget'
    };

    try {
      navigate(route);
    } catch {
      // Fallback zu Hauptroute
      navigate(mainRoutes[route] || '/dashboard');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schnelle Aktionen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className={`h-auto p-3 flex flex-col items-center gap-1 text-white border-none ${action.color}`}
              onClick={() => handleActionClick(action.route)}
            >
              {action.icon}
              <span className="text-xs font-medium text-center leading-tight">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};