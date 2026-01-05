import { Card, CardContent } from "@/components/ui/card";
import { Clock, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReportStatisticsCardsProps {
  totalHours: number;
  targetHours: number;
  productivity: number;
  productivityChange: number;
  avgHoursPerDay: number;
  workDays: number;
  overtime: number;
}

const ReportStatisticsCards = ({
  totalHours,
  targetHours,
  productivity,
  productivityChange,
  avgHoursPerDay,
  workDays,
  overtime
}: ReportStatisticsCardsProps) => {
  const formatHours = (hours: number) => {
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) - h) * 60);
    return `${hours < 0 ? '-' : ''}${h}:${m.toString().padStart(2, '0')}`;
  };

  const progressPercentage = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gesamtstunden */}
      <Card className="bg-gradient-to-br from-violet-100 to-indigo-50 border-0 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-600">Gesamtstunden</span>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatHours(totalHours)}
          </div>
          <p className="text-xs text-gray-500 mb-3">von {formatHours(targetHours)} Ziel</p>
          <Progress value={Math.min(progressPercentage, 100)} className="h-1.5 bg-indigo-200" />
        </CardContent>
      </Card>

      {/* Produktivität */}
      <Card className="bg-gradient-to-br from-green-100 to-emerald-50 border-0 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-600">Produktivität</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(productivity)}%
          </div>
          <p className="text-xs text-green-600 flex items-center gap-1 mb-3">
            <TrendingUp className="h-3 w-3" />
            {productivityChange > 0 ? '+' : ''}{productivityChange}% vs. Vormonat
          </p>
          <Progress value={Math.min(productivity, 100)} className="h-1.5 bg-green-200" />
        </CardContent>
      </Card>

      {/* Ø Stunden/Tag */}
      <Card className="bg-gradient-to-br from-blue-100 to-cyan-50 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Ø Stunden/Tag</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {avgHoursPerDay.toFixed(1)} h
          </div>
          <p className="text-xs text-gray-500">
            {workDays} Arbeitstage erfasst
          </p>
        </CardContent>
      </Card>

      {/* Über-/Unterzeit */}
      <Card className={`bg-gradient-to-br ${overtime >= 0 ? 'from-orange-100 to-amber-50' : 'from-red-100 to-rose-50'} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${overtime >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
              Über-/Unterzeit
            </span>
            <div className={`p-2 ${overtime >= 0 ? 'bg-orange-100' : 'bg-red-100'} rounded-lg`}>
              <AlertCircle className={`h-4 w-4 ${overtime >= 0 ? 'text-orange-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${overtime >= 0 ? 'text-orange-900' : 'text-red-900'} mb-1`}>
            {formatHours(overtime)}
          </div>
          <p className="text-xs text-gray-500">
            Monatssaldo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportStatisticsCards;