import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BudgetHeader from './BudgetHeader';
import BudgetStatsCards from './BudgetStatsCards';
import BudgetByTypeChart from './BudgetByTypeChart';
import BudgetDistributionChart from './BudgetDistributionChart';
import ProjectBudgetDetails from './ProjectBudgetDetails';

interface BudgetStats {
  plannedBudget: number;
  actualExpenses: number;
  actualExpensesDeviation: number;
  forecast: number;
  forecastDeviation: number;
  projectsOverBudget: number;
  forecastRisk: number;
}

interface ProjectBudget {
  id: string;
  name: string;
  category: string;
  costCenter: string;
  owner: string;
  planned: number;
  actual: number;
  actualDeviation: number;
  forecast: number;
  forecastDeviation: number;
  consumedPercent: number;
}

interface BudgetByTypeData {
  category: string;
  plan: number;
  actual: number;
  forecast: number;
}

interface BudgetDistributionData {
  name: string;
  value: number;
  color: string;
}

const EnterpriseBudgetTab = () => {
  const [stats, setStats] = useState<BudgetStats>({
    plannedBudget: 0,
    actualExpenses: 0,
    actualExpensesDeviation: 0,
    forecast: 0,
    forecastDeviation: 0,
    projectsOverBudget: 0,
    forecastRisk: 0,
  });
  const [projectBudgets, setProjectBudgets] = useState<ProjectBudget[]>([]);
  const [budgetByType, setBudgetByType] = useState<BudgetByTypeData[]>([]);
  const [budgetDistribution, setBudgetDistribution] = useState<BudgetDistributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const { data: projects } = await supabase
          .from('projects')
          .select(`
            id,
            name,
            project_type,
            budget,
            actual_cost,
            owner_id,
            profiles:owner_id (full_name)
          `)
          .not('budget', 'is', null);

        if (projects && projects.length > 0) {
          // Calculate stats
          const totalPlanned = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          const totalActual = projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0);
          const overBudget = projects.filter(p => (p.actual_cost || 0) > (p.budget || 0)).length;

          setStats({
            plannedBudget: totalPlanned,
            actualExpenses: totalActual,
            actualExpensesDeviation: totalPlanned > 0 ? Math.round(((totalActual - totalPlanned) / totalPlanned) * 100) : 0,
            forecast: totalActual * 1.1,
            forecastDeviation: totalPlanned > 0 ? Math.round((((totalActual * 1.1) - totalPlanned) / totalPlanned) * 100) : 0,
            projectsOverBudget: overBudget,
            forecastRisk: Math.ceil(overBudget / 2),
          });

          // Map project budgets
          const mappedProjects: ProjectBudget[] = projects.map(p => {
            const planned = p.budget || 0;
            const actual = p.actual_cost || 0;
            const forecast = actual * 1.1;
            const profileData = p.profiles as unknown as { full_name: string } | null;
            
            return {
              id: p.id,
              name: p.name,
              category: p.project_type || 'Sonstige',
              costCenter: `CC-${p.id.slice(0, 3).toUpperCase()}-001`,
              owner: profileData?.full_name || 'Nicht zugewiesen',
              planned,
              actual,
              actualDeviation: planned > 0 ? Math.round(((actual - planned) / planned) * 100) : 0,
              forecast,
              forecastDeviation: planned > 0 ? Math.round(((forecast - planned) / planned) * 100) : 0,
              consumedPercent: planned > 0 ? Math.round((actual / planned) * 100) : 0,
            };
          });
          setProjectBudgets(mappedProjects);

          // Group by type for bar chart
          const typeGroups: Record<string, BudgetByTypeData> = {};
          projects.forEach(p => {
            const type = p.project_type || 'Sonstige';
            if (!typeGroups[type]) {
              typeGroups[type] = { category: type, plan: 0, actual: 0, forecast: 0 };
            }
            typeGroups[type].plan += (p.budget || 0) / 1000;
            typeGroups[type].actual += (p.actual_cost || 0) / 1000;
            typeGroups[type].forecast += ((p.actual_cost || 0) * 1.1) / 1000;
          });
          setBudgetByType(Object.values(typeGroups));

          // Distribution for pie chart
          const COLORS = ['#3b82f6', '#ef4444', '#eab308', '#22c55e', '#10b981'];
          const distribution = Object.entries(typeGroups).map(([name, data], index) => ({
            name,
            value: Math.round(data.actual),
            color: COLORS[index % COLORS.length],
          }));
          setBudgetDistribution(distribution);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BudgetHeader />
        <div className="text-center py-12 text-muted-foreground">Lädt Budget-Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHeader />
      <BudgetStatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetByTypeChart data={budgetByType} />
        <BudgetDistributionChart data={budgetDistribution} />
      </div>
      
      <ProjectBudgetDetails projects={projectBudgets} />
    </div>
  );
};

export default EnterpriseBudgetTab;
