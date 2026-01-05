import { useState, useEffect } from 'react';
import { GoalCardData, GoalStatusFilter, DepartmentFilter } from '@/types/goals-statistics';
import { goalsStatisticsService } from '@/services/goalsStatisticsService';
import { GoalCard } from '../components/GoalCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export const TeamGoalsTab = () => {
  const [goals, setGoals] = useState<GoalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<GoalStatusFilter>('all');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsStatisticsService.getTeamGoals('current-team');
      setGoals(data);
    } catch (error) {
      console.error('Fehler beim Laden der Team-Ziele:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (statusFilter !== 'all' && goal.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && goal.department !== departmentFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Select value={departmentFilter} onValueChange={(v) => setDepartmentFilter(v as DepartmentFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="Management">Management</SelectItem>
            <SelectItem value="Support">Support</SelectItem>
            <SelectItem value="Qualität">Qualität</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GoalStatusFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="behind">Behind</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => (
          <GoalCard 
            key={goal.id} 
            goal={goal}
            onEdit={(id) => console.log('Edit goal:', id)}
            onCheckIn={(id) => console.log('Check-in goal:', id)}
          />
        ))}
      </div>
    </div>
  );
};
