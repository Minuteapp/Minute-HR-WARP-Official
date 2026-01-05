
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GoalsTabProps {
  employeeId: string;
}

export const GoalsTab = ({ employeeId }: GoalsTabProps) => {
  const { data: personalGoals = [], isLoading } = useQuery({
    queryKey: ['personalGoals', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('user_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: teamGoals = [] } = useQuery({
    queryKey: ['teamGoals', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Ziele</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      {/* Persönliche Ziele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Persönliche Ziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalGoals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine persönlichen Ziele definiert</p>
          ) : (
            <div className="space-y-4">
              {personalGoals.map((goal: any) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>
                  {goal.deadline && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Fällig: {new Date(goal.deadline).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team-Ziele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team-Ziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamGoals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Team-Ziele zugewiesen</p>
          ) : (
            <div className="space-y-4">
              {teamGoals.slice(0, 3).map((goal: any) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
