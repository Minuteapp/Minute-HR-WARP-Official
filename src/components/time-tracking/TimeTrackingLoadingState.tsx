
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Timer, Play } from 'lucide-react';

interface TimeTrackingLoadingStateProps {
  message?: string;
  showIcon?: boolean;
}

export const TimeTrackingLoadingState = ({ 
  message = "Zeiterfassung wird geladen...", 
  showIcon = true 
}: TimeTrackingLoadingStateProps) => {
  return (
    <Card className="p-6">
      <CardContent className="space-y-6">
        {/* Header Loading */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Main Control Loading */}
        <div className="flex flex-col items-center space-y-4">
          {showIcon && (
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-16 w-16 text-gray-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
            </div>
          )}
          
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-64 mx-auto" />
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Timer className="h-4 w-4 animate-pulse" />
              {message}
            </p>
          </div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <CardContent className="space-y-2 p-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls Loading */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingLoadingState;
