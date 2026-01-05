import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RiskStats {
  totalRisks: number;
  openRisks: number;
  criticalHigh: number;
  mitigated: number;
}

interface RiskStatsCardsProps {
  stats: RiskStats;
}

const RiskStatsCards = ({ stats }: RiskStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Gesamt Risiken</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalRisks}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="text-sm text-muted-foreground">Offene Risiken</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-orange-500">{stats.openRisks}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-muted-foreground">Kritisch/Hoch</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-red-500">{stats.criticalHigh}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-green-500" />
            <p className="text-sm text-muted-foreground">Gemildert</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-green-500">{stats.mitigated}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskStatsCards;
