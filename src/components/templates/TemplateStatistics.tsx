
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplateStatistics } from '@/hooks/useTemplates';
import { FileText, Users, TrendingUp, Clock } from 'lucide-react';

export const TemplateStatistics = () => {
  const { data: stats, isLoading } = useTemplateStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statisticCards = [
    {
      title: "Gesamt Templates",
      value: stats?.totalTemplates || 0,
      icon: FileText,
      description: "Verfügbare Vorlagen",
      color: "text-blue-600"
    },
    {
      title: "Aktive Nutzer",
      value: stats?.activeUsers || 0,
      icon: Users,
      description: "Nutzer diese Woche",
      color: "text-green-600"
    },
    {
      title: "Häufigste Nutzung",
      value: stats?.mostUsedTemplates?.[0]?.usage_count || 0,
      icon: TrendingUp,
      description: stats?.mostUsedTemplates?.[0]?.name || "Keine Daten",
      color: "text-orange-600"
    },
    {
      title: "Neue Templates",
      value: stats?.newTemplatesThisMonth || 0,
      icon: Clock,
      description: "Diesen Monat erstellt",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statisticCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
