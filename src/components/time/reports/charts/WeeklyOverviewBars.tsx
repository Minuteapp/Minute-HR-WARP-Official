import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WeeklyData } from '@/utils/timeReportCalculations';

interface WeeklyOverviewBarsProps {
  data: WeeklyData[];
}

const WeeklyOverviewBars = ({ data }: WeeklyOverviewBarsProps) => {
  const getStatusBadge = (hours: number, target: number) => {
    if (hours >= target) {
      return <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full font-medium">Erfüllt</span>;
    }
    return <span className="px-2 py-0.5 bg-white text-gray-700 text-xs rounded-full font-medium border border-gray-300">Unter Soll</span>;
  };

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Zeitübersicht nach Woche</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Keine Wochendaten verfügbar
          </p>
        ) : (
          data.map((week) => (
            <div key={week.week} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-900">{week.week}</span>
                  {getStatusBadge(week.hours, week.target)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {week.hours}h <span className="text-gray-400">von {week.target}h</span>
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gray-800 rounded-full transition-all"
                  style={{ width: `${Math.min((week.hours / week.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyOverviewBars;