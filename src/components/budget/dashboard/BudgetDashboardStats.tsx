
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

export const BudgetDashboardStats = () => {
  const stats = [
    {
      title: "Gesamt Budget",
      value: "€1.2M",
      change: "+12%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Verbraucht",
      value: "€850K",
      change: "-5%",
      trend: "down", 
      icon: TrendingDown
    },
    {
      title: "Verfügbar",
      value: "€350K",
      change: "+8%",
      trend: "up",
      icon: CheckCircle
    },
    {
      title: "Warnungen",
      value: "3",
      change: "+2",
      trend: "warning",
      icon: AlertCircle
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${
              stat.trend === 'up' ? 'text-green-600' : 
              stat.trend === 'down' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {stat.change} zum Vormonat
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
