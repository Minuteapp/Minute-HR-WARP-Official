
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, Clock, TrendingUp, AlertCircle, Shield, DollarSign, CheckCircle } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  trendText?: string;
}

const KPICard = ({ title, value, subtitle, icon, trend, trendText }: KPICardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive': return 'text-emerald-500';
      case 'negative': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <p className={`text-xs ${trendText ? getTrendColor() : 'text-muted-foreground'}`}>
          {trendText || subtitle}
        </p>
      </CardContent>
    </Card>
  );
};

interface ExecutiveKPICardsProps {
  activeCount: number;
  countryCount: number;
  avgDuration: number;
  avgCost: number;
  criticalDeadlines: number;
  complianceRisks: number;
  totalCostYTD: number;
  successRate: number;
}

export const ExecutiveKPICards = ({
  activeCount,
  countryCount,
  avgDuration,
  avgCost,
  criticalDeadlines,
  complianceRisks,
  totalCostYTD,
  successRate
}: ExecutiveKPICardsProps) => {
  return (
    <div className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Aktive Entsendungen"
          value={activeCount}
          subtitle={`+2 gegenüber Vorquartal`}
          icon={<Users className="h-5 w-5" />}
        />
        <KPICard
          title="Länderabdeckung"
          value={countryCount}
          subtitle="Über 3 Regionen verteilt"
          icon={<Globe className="h-5 w-5" />}
        />
        <KPICard
          title="Ø Entsendungsdauer"
          value={`${avgDuration} Mo.`}
          subtitle="Median: 12 Monate"
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          title="Kosten pro Entsendung"
          value={`€${Math.round(avgCost / 1000)}k`}
          subtitle="+8% über Budget"
          trendText="+8% über Budget"
          trend="negative"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Kritische Fristen"
          value={criticalDeadlines}
          subtitle="Innerhalb 60 Tage"
          trendText="Innerhalb 60 Tage"
          trend="negative"
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
        />
        <KPICard
          title="Compliance-Risiken"
          value={complianceRisks}
          subtitle="Sofortige Maßnahmen erforderlich"
          trendText="Sofortige Maßnahmen erforderlich"
          trend="negative"
          icon={<Shield className="h-5 w-5 text-red-500" />}
        />
        <KPICard
          title="Gesamtkosten YTD"
          value={`€${(totalCostYTD / 1000000).toFixed(2)}M`}
          subtitle={`Budget: €2.8M`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="Erfolgsquote"
          value={`${successRate}%`}
          subtitle="Erfolgreiche Abschlüsse"
          trendText="Erfolgreiche Abschlüsse"
          trend="positive"
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        />
      </div>
    </div>
  );
};
