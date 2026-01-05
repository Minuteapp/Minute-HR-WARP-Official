import { Clock, Calendar, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HistoryEmptyStateProps {
  onStartTracking?: () => void;
}

const HistoryEmptyState = ({ onStartTracking }: HistoryEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon-Illustration */}
      <div className="relative w-48 h-48 mb-6">
        {/* Gradient Hintergrund */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 opacity-50 animate-pulse"></div>
        
        {/* Haupt-Icon: Kalender mit Uhr */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Calendar className="h-32 w-32 text-purple-300 opacity-70" />
          <Clock className="absolute h-16 w-16 text-blue-500" />
        </div>
        
        {/* Deko-Icons */}
        <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <div className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-md">
          <TrendingUp className="h-10 w-10 text-green-400" />
        </div>
      </div>
      
      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Noch keine Arbeitszeit erfasst
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Beginnen Sie mit der Zeiterfassung im Dashboard, um hier Ihre Arbeitshistorie und Statistiken zu sehen.
      </p>
      
      {/* Optional: CTA Button */}
      {onStartTracking && (
        <Button 
          onClick={onStartTracking}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Clock className="h-4 w-4 mr-2" />
          Zeiterfassung starten
        </Button>
      )}
    </div>
  );
};

export default HistoryEmptyState;
