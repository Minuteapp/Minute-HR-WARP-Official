import { TrendingUp, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { PulseKPICard } from '../shared/PulseKPICard';

interface SurveyResultsKPIsProps {
  kpis: {
    avgScore: number;
    scoreTrend: string;
    participation: number;
    totalEmployees: number;
    respondents: number;
    comments: number;
    commentRate: number;
    criticalAreas: string[];
  };
}

export const SurveyResultsKPIs = ({ kpis }: SurveyResultsKPIsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PulseKPICard
        icon={TrendingUp}
        label="Durchschnittlicher Score"
        value={kpis.avgScore.toFixed(1)}
        subtitle={`${kpis.scoreTrend} vs. letztes Quartal`}
        color="blue"
      />
      
      <PulseKPICard
        icon={Users}
        label="Beteiligung"
        value={`${kpis.participation}%`}
        subtitle={`${kpis.respondents.toLocaleString()} von ${kpis.totalEmployees.toLocaleString()} Mitarbeitern`}
        color="green"
      />
      
      <PulseKPICard
        icon={MessageSquare}
        label="Freitext-Kommentare"
        value={kpis.comments.toLocaleString()}
        subtitle={`${kpis.commentRate}% haben kommentiert`}
        color="purple"
      />
      
      <PulseKPICard
        icon={AlertTriangle}
        label="Kritische Bereiche"
        value={kpis.criticalAreas.length.toString()}
        subtitle={kpis.criticalAreas.join(', ')}
        color="red"
      />
    </div>
  );
};
