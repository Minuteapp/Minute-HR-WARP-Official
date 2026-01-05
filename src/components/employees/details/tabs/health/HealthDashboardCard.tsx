import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Calendar, Heart, TrendingUp } from "lucide-react";
import { HealthMetrics } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface HealthDashboardCardProps {
  metrics?: HealthMetrics;
}

export const HealthDashboardCard = ({ metrics }: HealthDashboardCardProps) => {
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gesundheits-Dashboard & Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Keine Gesundheitsdaten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return { className: '', label: '' };
    
    const statusMap: Record<string, { className: string; label: string }> = {
      below_average: { className: 'bg-green-500/10 text-green-700 border-green-200', label: 'Unterdurchschnittlich' },
      average: { className: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Durchschnittlich' },
      above_average: { className: 'bg-red-500/10 text-red-700 border-red-200', label: 'Überdurchschnittlich' },
      inactive: { className: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Inaktiv' },
      active: { className: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Aktiv' },
      very_active: { className: 'bg-green-500/10 text-green-700 border-green-200', label: 'Sehr aktiv' },
      good: { className: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Gut' },
      excellent: { className: 'bg-green-500/10 text-green-700 border-green-200', label: 'Ausgezeichnet' },
      outstanding: { className: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', label: 'Hervorragend' },
    };
    
    return statusMap[status] || { className: '', label: status };
  };

  const metricCards = [
    {
      label: 'Krankheitstage',
      value: `${metrics.sick_days_count} Tage`,
      status: metrics.sick_days_status,
      year: metrics.year,
    },
    {
      label: 'Gym Check-ins/Monat',
      value: `${metrics.gym_checkins_per_month}x`,
      status: metrics.gym_status,
    },
    {
      label: 'Gesundheitskurse',
      value: `${metrics.active_health_courses_count}`,
      status: metrics.courses_status,
    },
    {
      label: 'Präventionsbonus',
      value: `${metrics.prevention_bonus_earned} ${metrics.prevention_bonus_currency}`,
      subtitle: `Verdient ${metrics.year}`,
    },
    {
      label: 'Gesundheitsscore',
      value: `${metrics.health_score_percentage}%`,
      status: metrics.health_score_status,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Gesundheits-Dashboard & Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {metricCards.map((metric, index) => {
            const statusInfo = metric.status ? getStatusBadge(metric.status) : null;
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                {statusInfo && (
                  <Badge variant="outline" className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                )}
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1 min-w-[200px]">
            <FileText className="h-4 w-4 mr-2" />
            Gesundheitsbericht
          </Button>
          <Button variant="outline" className="flex-1 min-w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            Termine verwalten
          </Button>
          <Button variant="outline" className="flex-1 min-w-[200px]">
            <Heart className="h-4 w-4 mr-2" />
            Programme buchen
          </Button>
        </div>

        <Button className="w-full bg-black hover:bg-black/90 text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          EAP Beratung anfragen
        </Button>
      </CardContent>
    </Card>
  );
};
