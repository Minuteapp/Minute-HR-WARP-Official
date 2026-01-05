
import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, AlertCircle, Home, Clock } from 'lucide-react';

interface AbsenceIndicatorProps {
  date: Date;
  type: 'vacation' | 'sick' | 'homeoffice' | 'business' | 'special' | string;
  employee: string;
  hasShiftConflict?: boolean;
  resolved?: boolean;
}

const AbsenceIndicator: React.FC<AbsenceIndicatorProps> = ({
  date,
  type,
  employee,
  hasShiftConflict = false,
  resolved = false
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'vacation':
        return <Calendar className="h-3 w-3" />;
      case 'sick':
        return <AlertCircle className="h-3 w-3" />;
      case 'homeoffice':
        return <Home className="h-3 w-3" />;
      case 'business':
        return <Clock className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'homeoffice':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'business':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'vacation':
        return 'Urlaub';
      case 'sick':
        return 'Krank';
      case 'homeoffice':
        return 'Homeoffice';
      case 'business':
        return 'Dienstreise';
      case 'special':
        return 'Sonderurlaub';
      default:
        return type;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center space-x-1 ${getTypeColor()} px-2 py-1 rounded-md text-xs flex-shrink-0 max-w-full truncate`}>
            <span className="flex-shrink-0">
              {getTypeIcon()}
            </span>
            <span className="truncate">
              {employee}
            </span>
            {hasShiftConflict && (
              <Badge variant={resolved ? "outline" : "destructive"} className="ml-1 px-1 py-0 h-4 text-[10px]">
                {resolved ? 'Vertreten' : 'Konflikt'}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{getTypeLabel()}</p>
            <p className="text-xs">{employee}</p>
            <p className="text-xs">{format(date, 'dd.MM.yyyy')}</p>
            {hasShiftConflict && (
              <p className="text-xs text-destructive font-medium">
                {resolved ? 'Schichtkonflikt wurde gelöst' : 'Kollidiert mit geplanter Schicht'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AbsenceIndicator;
