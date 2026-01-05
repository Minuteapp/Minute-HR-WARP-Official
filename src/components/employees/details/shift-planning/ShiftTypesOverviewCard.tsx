import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { formatTime } from '@/utils/shift-planning';

interface ShiftTypeDistribution {
  shiftType: {
    id: string;
    name: string;
    color: string;
    start_time: string;
    end_time: string;
  };
  count: number;
  percentage: number;
}

interface ShiftTypesOverviewCardProps {
  distribution: ShiftTypeDistribution[];
}

export const ShiftTypesOverviewCard = ({ distribution }: ShiftTypesOverviewCardProps) => {
  if (distribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schichttypen-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keine Schichtdaten verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = distribution.map(d => ({
    name: d.shiftType.name,
    value: d.count,
    color: d.shiftType.color,
    time: `${formatTime(d.shiftType.start_time)} - ${formatTime(d.shiftType.end_time)}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schichttypen-Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((dist) => (
            <div key={dist.shiftType.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <p className="font-medium">{dist.shiftType.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(dist.shiftType.start_time)} - {formatTime(dist.shiftType.end_time)}
                  </p>
                </div>
                <p className="font-medium">{dist.count} Schichten</p>
              </div>
              
              <div className="h-8 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full flex items-center justify-end px-3 text-white text-xs font-medium transition-all"
                  style={{ 
                    width: `${dist.percentage}%`,
                    backgroundColor: dist.shiftType.color,
                    minWidth: dist.percentage > 0 ? '40px' : '0',
                  }}
                >
                  {dist.percentage > 10 && `${dist.percentage.toFixed(0)}%`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} fontSize={12} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
