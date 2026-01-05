import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PersonalplanungKPIData {
  totalEmployees: { value: number; planned: number; missing: number };
  utilization: { percent: number; isGreen: boolean };
  missingEmployees: { value: number; affectedDepartment: string };
  activeJobPostings: { value: number; veryUrgent: number };
}

interface PersonalplanungKPICardsProps {
  data?: PersonalplanungKPIData;
}

export const PersonalplanungKPICards = ({ data }: PersonalplanungKPICardsProps) => {
  const kpis = [
    {
      icon: Users,
      title: "Mitarbeiter gesamt",
      value: data?.totalEmployees?.value ?? "-",
      subtitle: `Geplant: ${data?.totalEmployees?.planned ?? "-"}`,
      badge: data?.totalEmployees?.missing ? {
        text: `${data.totalEmployees.missing} fehlen`,
        variant: "destructive" as const
      } : null,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Wie beschäftigt sind wir?",
      value: data?.utilization?.percent ? `${data.utilization.percent}%` : "-",
      subtitle: data?.utilization?.isGreen ? "✓ Im grünen Bereich" : "Bereich prüfen",
      subtitleColor: data?.utilization?.isGreen ? "text-green-600" : "text-orange-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: AlertTriangle,
      title: "Mitarbeiter fehlen",
      value: data?.missingEmployees?.value ?? "-",
      subtitle: data?.missingEmployees?.affectedDepartment 
        ? `⚠️ Besonders ${data.missingEmployees.affectedDepartment} betroffen`
        : "Keine kritischen Bereiche",
      subtitleColor: data?.missingEmployees?.value ? "text-red-600" : "text-muted-foreground",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      icon: FileText,
      title: "Stellenanzeigen aktiv",
      value: data?.activeJobPostings?.value ?? "-",
      subtitle: data?.activeJobPostings?.veryUrgent 
        ? `${data.activeJobPostings.veryUrgent} sehr dringend`
        : "Keine dringenden",
      subtitleColor: data?.activeJobPostings?.veryUrgent ? "text-red-600" : "text-muted-foreground",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              {kpi.badge && (
                <Badge variant="destructive" className="text-xs">
                  {kpi.badge.text}
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
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
