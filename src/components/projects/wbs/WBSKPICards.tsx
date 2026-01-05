import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WBSMetrics } from '@/utils/wbsUtils';

interface WBSKPICardsProps {
  metrics: WBSMetrics;
}

export const WBSKPICards = ({ metrics }: WBSKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Gesamtfortschritt */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Gesamtfortschritt</span>
          </div>
          <div className="text-3xl font-bold text-primary">{metrics.totalProgress}%</div>
          <Progress value={metrics.totalProgress} className="h-2 mt-2" />
        </CardContent>
      </Card>

      {/* Stunden (ist/Plan) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Stunden (ist/Plan)</span>
          </div>
          <div className="text-3xl font-bold">{metrics.hoursSpent}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            von {metrics.hoursPlanned}h
          </p>
        </CardContent>
      </Card>

      {/* Kosten (ist/Plan) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Kosten (ist/Plan)</span>
          </div>
          <div className="text-3xl font-bold">€{metrics.costSpent}k</div>
          <p className="text-xs text-muted-foreground mt-1">
            von €{metrics.costPlanned}k
          </p>
        </CardContent>
      </Card>

      {/* CO₂-Impact */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">CO₂-Impact</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {metrics.co2Impact}t
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            CO₂-Emissionen
          </p>
        </CardContent>
      </Card>

      {/* Epics */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Epics</span>
          </div>
          <div className="text-3xl font-bold">{metrics.totalEpics}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Hauptinitiativen
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
