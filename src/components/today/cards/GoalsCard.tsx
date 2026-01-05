
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface GoalsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const GoalsCard = ({ darkMode, onToggleVisibility }: GoalsCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Lade Ziele aus der Datenbank
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['user-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'completed')
        .is('archived_at', null)
        .is('deleted_at', null)
        .order('due_date', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const getGoalColor = (goal: any) => {
    if (!goal.due_date) return 'bg-blue-500';
    
    const dueDate = new Date(goal.due_date);
    const today = new Date();
    const oneMonthFromNow = addDays(today, 30);
    
    if (isBefore(dueDate, today)) {
      return 'bg-red-500';
    } else if (isBefore(dueDate, oneMonthFromNow)) {
      return 'bg-yellow-500';
    } else {
      return 'bg-blue-500';
    }
  };
  
  const getGoalTimeframe = (goal: any) => {
    if (!goal.start_date || !goal.due_date) return 'Kein Zeitrahmen';
    const startDate = format(new Date(goal.start_date), 'MMM yyyy', { locale: de });
    const dueDate = format(new Date(goal.due_date), 'MMM yyyy', { locale: de });
    return `${startDate} - ${dueDate}`;
  };
  
  // Berechne, wie viele Ziele gefährdet sind (Frist < 1 Monat und Fortschritt < 70%)
  const getAtRiskGoalsCount = () => {
    const today = new Date();
    const oneMonthFromNow = addDays(today, 30);
    
    return goals.filter(goal => {
      if (!goal.due_date) return false;
      const dueDate = new Date(goal.due_date);
      return isBefore(dueDate, oneMonthFromNow) && (goal.progress || 0) < 70;
    }).length;
  };
  
  const atRiskCount = getAtRiskGoalsCount();
  
  return (
    <Card className={`today-card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Target className="h-5 w-5 text-primary" />
          Meine Ziele
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/goals')}>
              Alle Ziele
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/goals/new')}>
              Neues Ziel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {atRiskCount > 0 && (
          <div className={`p-2 rounded-md mb-3 text-sm flex items-center font-medium ${
            darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-50 text-amber-700'
          }`}>
            <span>⚠️ {atRiskCount} {atRiskCount === 1 ? 'Ziel ist' : 'Ziele sind'} gefährdet</span>
          </div>
        )}
        
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Lade Ziele...
            </div>
          ) : goals.length > 0 ? (
            goals.map((goal) => (
              <div
                key={goal.id}
                className={`p-3 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{goal.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {goal.progress || 0}%
                  </span>
                </div>
                
                <Progress
                  value={goal.progress || 0}
                  className={`h-2 ${darkMode ? 'bg-gray-600' : ''}`}
                />
                
                <div className="mt-2 text-sm flex justify-between items-center">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getGoalTimeframe(goal)}
                  </span>
                  {goal.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      goal.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                        : goal.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {goal.priority === 'high' ? 'Hohe Priorität' : ''}
                      {goal.priority === 'medium' ? 'Mittlere Priorität' : ''}
                      {goal.priority === 'low' ? 'Niedrige Priorität' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine aktiven Ziele
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/goals')}
        >
          Alle anzeigen
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full ml-2"
          onClick={() => navigate('/goals/new')}
        >
          <Plus className="h-4 w-4 mr-1" />
          Neues Ziel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoalsCard;
