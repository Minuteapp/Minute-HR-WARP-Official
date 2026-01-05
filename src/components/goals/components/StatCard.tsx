import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  bgColor = 'bg-card',
  textColor = 'text-foreground'
}: StatCardProps) => {
  return (
    <div className={cn("rounded-xl p-6 shadow-sm border", bgColor)}>
      <div className="flex items-start justify-between mb-4">
        <Icon className={cn("h-5 w-5", textColor)} />
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.value}
          </span>
        )}
      </div>
      
      <p className={cn("text-3xl font-bold mb-1", textColor)}>
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
};
