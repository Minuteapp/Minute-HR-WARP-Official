import { Card, CardContent } from "@/components/ui/card";

interface StatsData {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
}

interface CertificateStatsProps {
  stats: StatsData;
}

const StatCard = ({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: 'gray' | 'green' | 'orange' | 'red';
}) => {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  };

  const textColorClasses = {
    gray: 'text-gray-900',
    green: 'text-green-900',
    orange: 'text-orange-900',
    red: 'text-red-900',
  };

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${textColorClasses[color]}`}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CertificateStats = ({ stats }: CertificateStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Gesamt" value={stats.total} color="gray" />
      <StatCard label="Gültig" value={stats.valid} color="green" />
      <StatCard label="Bald ablaufend" value={stats.expiringSoon} color="orange" />
      <StatCard label="Abgelaufen" value={stats.expired} color="red" />
    </div>
  );
};
