import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Play, Wallet, TrendingUp } from "lucide-react";

interface MeasuresKPIs {
  totalMeasures: { value: number; categories: number };
  inProgress: { value: number; avgProgress: number };
  totalBudget: { value: number; year: number };
  expectedImpact: { fte: number; targetQuarter: string };
}

interface MeasuresKPICardsProps {
  data?: MeasuresKPIs;
}

export const MeasuresKPICards = ({ data }: MeasuresKPICardsProps) => {
  const cards = [
    {
      icon: ClipboardList,
      title: "Gesamt Maßnahmen",
      value: data?.totalMeasures.value ?? 0,
      subtitle: `${data?.totalMeasures.categories ?? 0} Kategorien`,
      valueColor: "text-foreground"
    },
    {
      icon: Play,
      title: "In Bearbeitung",
      value: data?.inProgress.value ?? 0,
      subtitle: `Durchschn. Fortschritt: ${data?.inProgress.avgProgress ?? 0}%`,
      valueColor: "text-blue-600"
    },
    {
      icon: Wallet,
      title: "Gesamtbudget",
      value: `${data?.totalBudget.value ?? 0}k €`,
      subtitle: `Verplant ${data?.totalBudget.year ?? new Date().getFullYear()}`,
      valueColor: "text-foreground"
    },
    {
      icon: TrendingUp,
      title: "Erwarteter Impact",
      value: `+${data?.expectedImpact.fte ?? 0} FTE`,
      subtitle: `Bis ${data?.expectedImpact.targetQuarter ?? 'Q4 2025'}`,
      valueColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <card.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
