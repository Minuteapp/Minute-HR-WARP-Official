import { Clock, TrendingUp, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeTracking } from '@/hooks/useTimeTracking';

const MobileTimeTrackingCard = () => {
  const navigate = useNavigate();
  const {
    elapsedTime,
    dailyWorkHours,
    isLoading,
    currentActiveEntry
  } = useTimeTracking();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}:${String(mins).padStart(2, '0')}h`;
  };

  const startTime = currentActiveEntry?.started_at 
    ? new Date(currentActiveEntry.started_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : '08:00';

  if (isLoading) return <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/80"><div className="text-gray-500 text-xs">Lädt...</div></div>;

    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/80 cursor-pointer hover:shadow-xl hover:border-white transition-all h-full flex flex-col"
      onClick={() => navigate('/time')}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3ad1] bg-[#2c3ad1]/10 flex items-center justify-center flex-shrink-0">
          <Clock className="h-4 w-4 text-[#2c3ad1]" />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[9px] font-semibold text-green-500">Live</span>
          <TrendingUp className="h-2.5 w-2.5 text-green-500" />
          <span className="text-[9px] text-green-500">+15m</span>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </div>

      <h3 className="text-[11px] font-bold text-gray-700 mb-0.5 leading-tight">Zeiterfassung</h3>
      <div className="text-2xl font-bold text-gray-900 mb-0.5 leading-tight">{formatTime(elapsedTime)}</div>
      <p className="text-[9px] text-gray-500 mb-2 leading-tight">Aktiv seit {startTime}</p>

      {/* Weekly bars */}
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} className="flex-1 h-6 bg-[#8B7EFF] rounded"></div>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1 mb-2 mt-auto">
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>Tagesziel</span>
          <span className="font-semibold">{dailyWorkHours.toFixed(2)}/8h</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${Math.min((dailyWorkHours / 8) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Project breakdown */}
      <div className="space-y-0.5 text-[9px] text-gray-600 mb-1.5">
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#8B7EFF]"></span>
          <span>Projekt Alpha</span>
          <span className="ml-auto font-medium">3:20h</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#8B7EFF]"></span>
          <span>Meeting</span>
          <span className="ml-auto font-medium">1:45h</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#8B7EFF]"></span>
          <span>Admin</span>
          <span className="ml-auto font-medium">0:40h</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[9px] text-gray-400">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          vor 2m
        </span>
        <span>→</span>
      </div>
    </div>
};

export default MobileTimeTrackingCard;
