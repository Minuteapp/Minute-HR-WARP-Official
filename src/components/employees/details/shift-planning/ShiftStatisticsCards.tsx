import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ShiftStatistics {
  totalShifts: number;
  averageShiftLength: number;
  weekendShifts: number;
  maxWeekendShifts: number;
  reliabilityScore: number;
  reliabilityLabel: string;
  currentMonth: string;
}

interface ShiftStatisticsCardsProps {
  statistics: ShiftStatistics;
}

export const ShiftStatisticsCards = ({ statistics }: ShiftStatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Schichten */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl font-bold">{statistics.totalShifts}</p>
              <p className="text-sm text-muted-foreground mt-1">{statistics.currentMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Ø Länge */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-4xl font-bold">{statistics.averageShiftLength.toFixed(1)}h</p>
              <p className="text-sm text-muted-foreground mt-1">Standard: 8h</p>
              <Progress 
                value={(statistics.averageShiftLength / 8) * 100} 
                className="mt-2"
              />
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Wochenende */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-4xl font-bold">{statistics.weekendShifts}</p>
              <p className="text-sm text-muted-foreground mt-1">
                von max. {statistics.maxWeekendShifts}
              </p>
              <Progress 
                value={(statistics.weekendShifts / statistics.maxWeekendShifts) * 100} 
                className="mt-2"
              />
            </div>
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Zuverlässigkeit */}
      <Card className="bg-green-50 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                {statistics.reliabilityScore.toFixed(0)}%
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                {statistics.reliabilityLabel}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-700 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
