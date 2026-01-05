import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface TeamKPIData {
  totalHeadcount: { value: number; fte: number };
  availableHours: { value: number };
  boundHours: { value: number; percent: number };
  criticalTeams: { value: number; teams: string[] };
}

interface TeamKPICardsProps {
  data?: TeamKPIData;
}

export const TeamKPICards = ({ data }: TeamKPICardsProps) => {
  const kpis = [
    {
      icon: Users,
      title: "Gesamt Headcount",
      value: data?.totalHeadcount?.value ? `${data.totalHeadcount.value} Mitarbeiter` : "-",
      subtitle: data?.totalHeadcount?.fte ? `${data.totalHeadcount.fte} FTE` : "-",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Verfügbare Stunden",
      value: data?.availableHours?.value ? `${data.availableHours.value.toLocaleString()} h` : "-",
      subtitle: "Pro Monat",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Gebundene Stunden",
      value: data?.boundHours?.value ? `${data.boundHours.value.toLocaleString()} h` : "-",
      subtitle: data?.boundHours?.percent ? `${data.boundHours.percent}% Auslastung` : "-",
      subtitleColor: data?.boundHours?.percent && data.boundHours.percent < 100 ? "text-green-600" : "text-orange-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: AlertTriangle,
      title: "Über-/Unterauslastung",
      value: data?.criticalTeams?.value ? `${data.criticalTeams.value} Teams kritisch` : "-",
      subtitle: data?.criticalTeams?.teams?.length 
        ? data.criticalTeams.teams.join(", ")
        : "Keine kritischen Teams",
      subtitleColor: data?.criticalTeams?.value ? "text-red-600" : "text-muted-foreground",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <p className="text-xl font-bold mt-1">{kpi.value}</p>
              <p className={`text-xs mt-1 ${kpi.subtitleColor || 'text-muted-foreground'}`}>
                {kpi.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
