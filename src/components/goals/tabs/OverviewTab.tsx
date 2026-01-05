import { useEffect, useState } from 'react';
import { 
  UserGoalStats, 
  DepartmentStats, 
  KPIMetric 
} from '@/types/goals-statistics';
import { goalsStatisticsService } from '@/services/goalsStatisticsService';
import { UserStatsCard } from '../components/UserStatsCard';
import { StatCard } from '../components/StatCard';
import { DepartmentProgressCard } from '../components/DepartmentProgressCard';
import { KPIMetricCard } from '../components/KPIMetricCard';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Link2,
  Sparkles
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const OverviewTab = () => {
  const [userStats, setUserStats] = useState<UserGoalStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, departments, kpis] = await Promise.all([
        goalsStatisticsService.getUserGoalStats('current-user'),
        goalsStatisticsService.getDepartmentStats(),
        goalsStatisticsService.getKPIMetrics(),
      ]);

      setUserStats(user);
      setDepartmentStats(departments);
      setKpiMetrics(kpis);
    } catch (error) {
      console.error('Fehler beim Laden der Übersicht:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userStats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <UserStatsCard stats={userStats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Zielerreichung Gesamt"
          value={`${userStats.completionRate}%`}
          icon={TrendingUp}
          bgColor="bg-[#0066FF]/10"
          textColor="text-[#0066FF]"
        />
        <StatCard
          title="Ziele Gesamt"
          value={userStats.totalGoals}
          icon={Target}
        />
        <StatCard
          title="On Track"
          value={userStats.onTrack}
          icon={CheckCircle}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          title="At Risk"
          value={userStats.atRisk}
          icon={AlertTriangle}
          bgColor="bg-yellow-50"
          textColor="text-yellow-600"
        />
        <StatCard
          title="Behind"
          value={userStats.behind}
          icon={XCircle}
          bgColor="bg-red-50"
          textColor="text-red-600"
        />
        <StatCard
          title="Alignment-Rate"
          value={`${userStats.alignmentRate}%`}
          icon={Link2}
          bgColor="bg-[#0066FF]/10"
          textColor="text-[#0066FF]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Zielerreichung nach Abteilung
          </h3>
          <div className="space-y-3">
            {departmentStats.map((dept) => (
              <DepartmentProgressCard key={dept.department} stats={dept} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            KPI-Übersicht
          </h3>
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="space-y-1">
              {kpiMetrics.map((metric) => (
                <KPIMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0066FF]/10 to-purple-50 rounded-xl p-6 border border-[#0066FF]/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#0066FF] mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">KI-Zusammenfassung</h4>
            <p className="text-sm text-muted-foreground">
              Das Unternehmen erreicht aktuell {userStats.completionRate}% seiner Ziele. 
              Sie haben Vollzugriff auf alle {userStats.totalGoals} Ziele im System. 
              {userStats.atRisk > 0 && (
                <span className="text-yellow-700 font-medium">
                  {' '}Achtung: {userStats.atRisk} Ziele sind gefährdet und benötigen Aufmerksamkeit.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
