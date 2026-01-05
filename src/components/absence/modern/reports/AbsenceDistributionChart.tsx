import { useQuery } from '@tanstack/react-query';
import { absenceReportsService } from '@/services/absenceReportsService';

interface AbsenceDistributionChartProps {
  year: string;
}

export const AbsenceDistributionChart = ({ year }: AbsenceDistributionChartProps) => {
  const { data: distribution, isLoading } = useQuery({
    queryKey: ['absence-distribution', year],
    queryFn: () => absenceReportsService.getAbsenceDistribution(parseInt(year))
  });

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Lädt...</div>;
  }

  const distributionData = [
    { label: 'Urlaub', value: distribution?.vacation.days || 0, percentage: parseInt(distribution?.vacation.percentage || '0'), color: 'bg-blue-500' },
    { label: 'Krankheit', value: distribution?.sick_leave.days || 0, percentage: parseInt(distribution?.sick_leave.percentage || '0'), color: 'bg-red-500' },
    { label: 'Dienstreise', value: distribution?.business_trip.days || 0, percentage: parseInt(distribution?.business_trip.percentage || '0'), color: 'bg-green-500' },
    { label: 'Sonderurlaub', value: distribution?.other.days || 0, percentage: parseInt(distribution?.other.percentage || '0'), color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-4">
      {distributionData.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </div>
            <span className="font-bold">{item.value} ({item.percentage}%)</span>
          </div>
          
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${item.color} transition-all`}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
