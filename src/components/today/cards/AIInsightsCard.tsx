import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MoreHorizontal, AlertCircle, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isToday, addHours, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

interface AIInsightsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const AIInsightsCard = ({ darkMode, onToggleVisibility }: AIInsightsCardProps) => {
  const { user } = useAuth();
  
  // Lade Aufgaben für heute
  const { data: todayTasks = [] } = useQuery({
    queryKey: ['today-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .contains('assigned_to', [user.id])
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString())
        .eq('status', 'open');
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Lade Termine für die nächsten 3 Stunden
  const { data: upcomingMeetings = [] } = useQuery({
    queryKey: ['upcoming-meetings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const now = new Date();
      const threeHoursLater = addHours(now, 3);
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('created_by', user.id)
        .gte('start_time', now.toISOString())
        .lte('start_time', threeHoursLater.toISOString())
        .order('start_time');
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  // Lade Projekte mit Deadlines in den nächsten 2 Tagen
  const { data: urgentProjects = [] } = useQuery({
    queryKey: ['urgent-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const now = new Date();
      const twoDaysLater = new Date(now);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .gte('end_date', now.toISOString())
        .lte('end_date', twoDaysLater.toISOString())
        .neq('status', 'completed');
      
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const highPriorityTasks = todayTasks.filter(task => task.priority === 'high');
  
  // Produktivitätstrends berechnen
  const completionRate = todayTasks.length > 0 
    ? Math.round((todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100)
    : 0;
  
  // Workflow-Empfehlungen
  const hasEarlyMeetings = upcomingMeetings.some(m => {
    const hour = new Date(m.start_time).getHours();
    return hour < 10;
  });
  
  const insights = [
    {
      icon: TrendingUp,
      text: `Produktivität: ${completionRate}% Aufgaben heute abgeschlossen`,
      color: completionRate >= 70 ? 'text-green-500' : completionRate >= 40 ? 'text-yellow-500' : 'text-red-500',
      show: true
    },
    {
      icon: AlertCircle,
      text: `${highPriorityTasks.length} ${highPriorityTasks.length === 1 ? 'Aufgabe' : 'Aufgaben'} mit hoher Priorität heute fällig`,
      color: highPriorityTasks.length > 0 ? 'text-red-500' : 'text-green-500',
      show: true
    },
    {
      icon: Calendar,
      text: `${upcomingMeetings.length} ${upcomingMeetings.length === 1 ? 'Meeting' : 'Meetings'} in den nächsten 3 Stunden`,
      color: upcomingMeetings.length > 0 ? 'text-blue-500' : 'text-gray-500',
      show: true
    },
    {
      icon: AlertCircle,
      text: `${urgentProjects.length} ${urgentProjects.length === 1 ? 'Projekt-Deadline' : 'Projekt-Deadlines'} in 2 Tagen`,
      color: urgentProjects.length > 0 ? 'text-orange-500' : 'text-gray-500',
      show: urgentProjects.length > 0
    },
    {
      icon: TrendingUp,
      text: hasEarlyMeetings 
        ? 'Workflow-Tipp: Plane fokussierte Arbeitszeit nach frühen Meetings ein'
        : 'Workflow-Tipp: Starte mit der wichtigsten Aufgabe für maximale Produktivität',
      color: 'text-purple-500',
      show: true
    }
  ];
  
  return (
    <Card className="today-card h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Sparkles className="h-5 w-5 text-primary" />
          KI-Zusammenfassung
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <p className="text-sm text-muted-foreground mb-4">
          Dein Tag in 60 Sekunden
        </p>
        
        <div className="space-y-3 flex-1 overflow-y-auto">
          {insights.filter(insight => insight.show).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <span className="text-sm text-foreground">
                {insight.text}
              </span>
            </div>
          ))}
          
          {insights.filter(insight => insight.show).length === 0 && (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-foreground">Alles im grünen Bereich! 🎉</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t flex items-start gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {completionRate >= 70 
              ? 'Hervorragend! Du bist heute sehr produktiv. Weiter so! 🚀'
              : highPriorityTasks.length > 0 
              ? 'Fokussiere dich auf die wichtigsten Aufgaben für maximalen Impact'
              : 'Starte mit einer Aufgabe mit hoher Priorität für einen produktiven Tag'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
