
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const BudgetDashboardStats = () => {
  const stats = [
    {
      title: "Gesamtbudget",
      value: "€2.4M",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "vs. Vorjahr"
    },
    {
      title: "Aktuelle Ausgaben",
      value: "€1.8M",
      change: "+8.2%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "75% des Budgets"
    },
    {
      title: "Forecast Genauigkeit",
      value: "94.2%",
      change: "+2.1%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Durchschnitt Q4"
    },
    {
      title: "Kritische Alerts",
      value: "3",
      change: "-2",
      trend: "down" as const,
      icon: AlertTriangle,
      description: "Benötigen Aufmerksamkeit"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
