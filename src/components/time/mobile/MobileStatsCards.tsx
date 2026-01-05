import { Clock, Calendar, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileStatsCardsProps {
  isTracking: boolean;
  dailyWorkHours: number;
  weeklyWorkHours: number;
  status: 'online' | 'offline' | 'paused';
}

const MobileStatsCards = ({ 
  isTracking, 
  dailyWorkHours, 
  weeklyWorkHours, 
  status 
}: MobileStatsCardsProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1).replace('.', ',') + ' h';
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'paused': return 'Pausiert';
      default: return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {/* Aktuelle Zeit */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 shadow-sm">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="h-3 w-3 text-yellow-600" />
          <span className="text-[9px] font-medium text-yellow-900">Aktuelle Zeit</span>
        </div>
        <div className="text-[14px] font-bold text-yellow-900 font-mono">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Heute */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-sm">
        <div className="flex items-center gap-1 mb-0.5">
          <Clock className="h-3 w-3 text-blue-600" />
          <span className="text-[9px] font-medium text-blue-900">Heute</span>
        </div>
        <div className="text-[14px] font-bold text-blue-900">
          {formatHours(dailyWorkHours)}
        </div>
      </div>

      {/* Woche */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 shadow-sm">
        <div className="flex items-center gap-1 mb-0.5">
          <Calendar className="h-3 w-3 text-yellow-600" />
          <span className="text-[9px] font-medium text-yellow-900">Woche</span>
        </div>
        <div className="text-[14px] font-bold text-yellow-900">
          {formatHours(weeklyWorkHours)}
        </div>
      </div>

      {/* Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-sm">
        <div className="flex items-center gap-1 mb-0.5">
          <Activity className="h-3 w-3 text-blue-600" />
          <span className="text-[9px] font-medium text-blue-900">Status</span>
        </div>
        <div className={`text-[14px] font-bold ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
};

export default MobileStatsCards;
