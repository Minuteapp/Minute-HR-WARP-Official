import { Progress } from "@/components/ui/progress";
import { OKRMeasurementBadge } from "./OKRMeasurementBadge";

interface OKRKeyResultItemProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  measurementType: 'automatic' | 'manual';
}

export const OKRKeyResultItem = ({ 
  title, 
  currentValue, 
  targetValue, 
  unit, 
  measurementType 
}: OKRKeyResultItemProps) => {
  const progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;

  return (
    <div className="py-2 border-b last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <OKRMeasurementBadge type={measurementType} />
      </div>
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-2 [&>div]:bg-teal-500" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {currentValue}/{targetValue} {unit}
        </span>
      </div>
    </div>
  );
};
