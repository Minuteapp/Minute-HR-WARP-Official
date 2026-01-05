import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  value: string | number;
  label: string;
  color?: 'default' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  default: 'text-foreground',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
};

const StatCard = ({ value, label, color = 'default' }: StatCardProps) => {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

const ProjectListStats = () => {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-around">
          <StatCard value="-" label="Gefilterte Projekte" />
          <StatCard value="-" label="Aktiv" color="green" />
          <StatCard value="-" label="At Risk" color="yellow" />
          <StatCard value="-" label="Verspätet" color="red" />
          <StatCard value="-" label="Ø Fortschritt" color="green" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectListStats;
