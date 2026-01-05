import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Euro, AlertCircle, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  isLoading?: boolean;
}

const KPICard = ({ title, value, subtitle, trend, icon, isLoading }: KPICardProps) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-4 w-4 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-32 mb-1" />
          <div className="h-3 bg-muted rounded w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium mt-1",
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PayrollKPICardsProps {
  employeeCount: number;
  totalCosts: number;
  openIssuesCount: number;
  averageCostPerEmployee: number;
  costTrend?: { value: string; isPositive: boolean };
  isLoading?: boolean;
}

export const PayrollKPICards = ({
  employeeCount,
  totalCosts,
  openIssuesCount,
  averageCostPerEmployee,
  costTrend,
  isLoading,
}: PayrollKPICardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Mitarbeiter"
        value={employeeCount.toLocaleString("de-DE")}
        subtitle="Aktive MA"
        icon={<Users className="h-4 w-4 text-primary" />}
        isLoading={isLoading}
      />

      <KPICard
        title="Gesamtkosten"
        value={formatCurrency(totalCosts)}
        subtitle="Aktueller Monat"
        trend={costTrend}
        icon={<Euro className="h-4 w-4 text-primary" />}
        isLoading={isLoading}
      />

      <KPICard
        title="Offene Punkte"
        value={openIssuesCount.toString()}
        subtitle={openIssuesCount === 0 ? "Alle geklärt ✓" : "Vor Abrechnung klären"}
        icon={
          <AlertCircle
            className={cn(
              "h-4 w-4",
              openIssuesCount > 0 ? "text-destructive" : "text-emerald-600"
            )}
          />
        }
        isLoading={isLoading}
      />

      <KPICard
        title="Ø Kosten/MA"
        value={formatCurrency(averageCostPerEmployee)}
        subtitle="Durchschnitt"
        icon={<Calculator className="h-4 w-4 text-primary" />}
        isLoading={isLoading}
      />
    </div>
  );
};
