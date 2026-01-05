import { Card, CardContent } from "@/components/ui/card";
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RisksKPICardsProps {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export const RisksKPICards = ({
  criticalCount,
  highCount,
  mediumCount,
  lowCount
}: RisksKPICardsProps) => {
  const cards = [
    {
      title: "Kritische Risiken",
      value: criticalCount,
      icon: AlertOctagon,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Hohe Risiken",
      value: highCount,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Mittlere Risiken",
      value: mediumCount,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Niedrige Risiken",
      value: lowCount,
      icon: Info,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
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
