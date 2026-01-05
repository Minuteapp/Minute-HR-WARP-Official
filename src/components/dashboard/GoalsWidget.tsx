import { Target, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useCompany } from '@/contexts/CompanyContext';

const GoalsWidget = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  // Lade aktive Ziele
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['active-goals', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return [];

      const { data } = await supabase
        .from('goals')
        .select('id, title, progress, status, target_date')
        .eq('company_id', effectiveCompanyId)
        .in('status', ['active', 'in_progress', 'pending'])
        .order('target_date', { ascending: true })
        .limit(5);

      return data || [];
    }
  });

  // Berechne Durchschnittsfortschritt
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length)
    : 0;

  const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;

  const handleWidgetClick = () => {
    navigate('/goals');
  };

  const handleGoalClick = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/goals/${goalId}`);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Ziele</h2>
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200 text-xs">
          {avgProgress}% Fortschritt
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold mb-0.5">{goals.length}</div>
          <div className="text-xs text-gray-600">Aktive Ziele</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold mb-0.5">{completedGoals}</div>
          <div className="text-xs text-gray-600">Erreicht</div>
        </div>
      </div>
      
      {goals.length > 0 ? (
        <div className="space-y-3 mb-3">
          {goals.slice(0, 3).map((goal) => (
            <div 
              key={goal.id}
              className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={(e) => handleGoalClick(goal.id, e)}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-gray-800 truncate flex-1">{goal.title}</p>
                <span className="text-xs text-gray-500 ml-2">{goal.progress || 0}%</span>
              </div>
              <Progress value={goal.progress || 0} className="h-1.5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center mb-3">
          <Target className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Keine aktiven Ziele</p>
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 h-9 text-sm"
        onClick={handleWidgetClick}
      >
        {goals.length > 0 ? 'Alle Ziele anzeigen' : 'Neues Ziel erstellen'}
      </Button>
    </Card>
  );
};

export default GoalsWidget;