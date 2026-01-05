
import { Progress } from "@/components/ui/progress";

interface ProgressSectionProps {
  dailyWorkHours: number;
  weeklyWorkHours: number;
}

const ProgressSection = ({ dailyWorkHours, weeklyWorkHours }: ProgressSectionProps) => {
  // Berechne Prozentsätze mit Begrenzung auf 100%
  const dailyPercentage = Math.min(Math.round((dailyWorkHours / 8) * 100), 100);
  const weeklyPercentage = Math.min(Math.round((weeklyWorkHours / 40) * 100), 100);
  
  // Bestimme Farben basierend auf Fortschritt
  const getDailyProgressColor = () => {
    if (dailyWorkHours > 10) return "text-red-500";
    if (dailyWorkHours > 8) return "text-amber-500";
    return "text-green-600";
  };
  
  const getWeeklyProgressColor = () => {
    if (weeklyWorkHours > 48) return "text-red-500";
    if (weeklyWorkHours > 40) return "text-amber-500";
    return "text-green-600";
  };

  return (
    <div className="space-y-3 w-full">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Tägliche Arbeitszeit</span>
          <span className={`text-sm font-medium ${getDailyProgressColor()}`}>
            {dailyWorkHours.toFixed(1)}h / 8h
          </span>
        </div>
        <Progress 
          value={dailyPercentage} 
          className={`h-2 ${dailyWorkHours > 10 ? 'bg-red-100' : dailyWorkHours > 8 ? 'bg-amber-100' : 'bg-green-100'}`}
        />
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Wöchentliche Arbeitszeit</span>
          <span className={`text-sm font-medium ${getWeeklyProgressColor()}`}>
            {weeklyWorkHours.toFixed(1)}h / 40h
          </span>
        </div>
        <Progress 
          value={weeklyPercentage}
          className={`h-2 ${weeklyWorkHours > 48 ? 'bg-red-100' : weeklyWorkHours > 40 ? 'bg-amber-100' : 'bg-green-100'}`}
        />
      </div>
    </div>
  );
};

export default ProgressSection;
