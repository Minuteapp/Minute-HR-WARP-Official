import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react";

interface CostsKPICardsProps {
  totalBudget: number;
  actualCosts: number;
  deviation: number;
  avgCostPerAssignment: number;
}

export const CostsKPICards = ({
  totalBudget,
  actualCosts,
  deviation,
  avgCostPerAssignment
}: CostsKPICardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: "Gesamtbudget",
      value: formatCurrency(totalBudget),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Tatsächliche Kosten",
      value: formatCurrency(actualCosts),
      icon: Calculator,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Abweichung",
      value: formatCurrency(deviation),
      icon: deviation >= 0 ? TrendingUp : TrendingDown,
      color: deviation >= 0 ? "text-red-600" : "text-green-600",
      bgColor: deviation >= 0 ? "bg-red-100" : "bg-green-100"
    },
    {
      title: "Ø Kosten/Entsendung",
      value: formatCurrency(avgCostPerAssignment),
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
