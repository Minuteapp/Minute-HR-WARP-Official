import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface AIKPICardsProps {
  critical: number;
  warnings: number;
  forecasts: number;
}

export const AIKPICards = ({ critical, warnings, forecasts }: AIKPICardsProps) => {
  const cards = [
    {
      label: "Kritische Insights",
      value: critical,
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      label: "Warnungen",
      value: warnings,
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      label: "Prognosen",
      value: forecasts,
      icon: TrendingUp,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
