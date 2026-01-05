import { useState, useEffect } from 'react';
import { GoalCardData } from '@/types/goals-statistics';
import { goalsStatisticsService } from '@/services/goalsStatisticsService';
import { GoalHierarchyTree } from '../components/GoalHierarchyTree';
import { GoalDetailPanel } from '../components/GoalDetailPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const CompanyGoalsTab = () => {
  const [goals, setGoals] = useState<GoalCardData[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'dependencies'>('hierarchy');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsStatisticsService.getCompanyGoals();
      setGoals(data);
    } catch (error) {
      console.error('Fehler beim Laden der Unternehmensziele:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Goal Alignment Map</h2>
        </div>
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'hierarchy' | 'dependencies')}>
          <TabsList>
            <TabsTrigger value="hierarchy">Hierarchie</TabsTrigger>
            <TabsTrigger value="dependencies">Abhängigkeiten</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <div className="overflow-y-auto pr-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            🏢 Unternehmensziele
          </h3>
          <GoalHierarchyTree 
            goals={goals}
            onSelectGoal={setSelectedGoal}
            selectedGoalId={selectedGoal?.id}
          />
        </div>

        <div className="overflow-y-auto">
          <GoalDetailPanel goal={selectedGoal} />
        </div>
      </div>
    </div>
  );
};
