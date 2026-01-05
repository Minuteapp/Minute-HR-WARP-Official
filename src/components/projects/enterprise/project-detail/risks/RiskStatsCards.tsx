
import { Card, CardContent } from "@/components/ui/card";

interface RiskStatsCardsProps {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const RiskStatsCards = ({ counts }: RiskStatsCardsProps) => {
  const stats = [
    { label: 'Kritisch', value: counts.critical, color: 'text-red-500' },
    { label: 'Hoch', value: counts.high, color: 'text-orange-500' },
    { label: 'Mittel', value: counts.medium, color: 'text-yellow-500' },
    { label: 'Niedrig', value: counts.low, color: 'text-green-500' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-white border border-gray-200">
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
