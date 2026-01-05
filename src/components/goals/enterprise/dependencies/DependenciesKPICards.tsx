import { Card } from "@/components/ui/card";
import { GitBranch, AlertTriangle, Link, BarChart3 } from "lucide-react";

interface DependenciesKPICardsProps {
  total: number;
  blocked: number;
  enabled: number;
  influenced: number;
}

export const DependenciesKPICards = ({ 
  total, 
  blocked, 
  enabled, 
  influenced 
}: DependenciesKPICardsProps) => {
  const cards = [
    {
      label: "Gesamt Abhängigkeiten",
      value: total,
      icon: GitBranch,
      iconColor: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      label: "Blockiert",
      value: blocked,
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      label: "Ermöglicht",
      value: enabled,
      icon: Link,
      iconColor: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      label: "Beeinflusst",
      value: influenced,
      icon: BarChart3,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
