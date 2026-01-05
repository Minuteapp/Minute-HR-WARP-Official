import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Palmtree, Receipt, Ticket, GraduationCap, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

export const EmployeeQuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { isModuleVisible } = useSidebarPermissions();

  const allActions = [
    { label: 'Zeit erfassen', icon: Clock, color: 'bg-orange-100 text-orange-600 hover:bg-orange-200', path: '/time-tracking' },
    { label: 'Urlaub beantragen', icon: Palmtree, color: 'bg-green-100 text-green-600 hover:bg-green-200', path: '/absence' },
    { label: 'Spesen einreichen', icon: Receipt, color: 'bg-blue-100 text-blue-600 hover:bg-blue-200', path: '/expenses' },
    { label: 'Ticket erstellen', icon: Ticket, color: 'bg-purple-100 text-purple-600 hover:bg-purple-200', path: '/helpdesk' },
    { label: 'Training starten', icon: GraduationCap, color: 'bg-pink-100 text-pink-600 hover:bg-pink-200', path: '/training' },
    { label: 'Ziel hinzufügen', icon: Target, color: 'bg-amber-100 text-amber-600 hover:bg-amber-200', path: '/goals' },
  ];

  // Filter actions based on permission matrix
  const actions = allActions.filter(action => isModuleVisible(action.path));

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Schnellzugriff
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto py-3 flex flex-col items-center gap-1 ${action.color}`}
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};