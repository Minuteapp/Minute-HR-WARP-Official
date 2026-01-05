import { CheckSquare, Clock, MoreVertical, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileTasksCard = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/80 cursor-pointer hover:shadow-xl hover:border-white transition-all h-full flex flex-col"
      onClick={() => navigate('/tasks')}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3ad1] bg-[#2c3ad1]/10 flex items-center justify-center flex-shrink-0">
          <CheckSquare className="h-4 w-4 text-[#2c3ad1]" />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <TrendingUp className="h-2.5 w-2.5 text-green-500" />
          <span className="text-[9px] font-semibold text-green-500">+2</span>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </div>

      <h3 className="text-[11px] font-bold text-gray-700 mb-0.5 leading-tight">Aufgaben</h3>
      <div className="text-2xl font-bold text-gray-900 mb-0.5 leading-tight">5 offen</div>
      <p className="text-[9px] text-gray-500 mb-2 leading-tight">7 von 12 erledigt</p>

      {/* Progress */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>Fortschritt</span>
          <span className="font-semibold">58%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-900 h-full rounded-full" style={{ width: '58%' }} />
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-1 mb-2 text-[9px] leading-tight flex-grow">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[8px] font-bold flex-shrink-0">!</span>
          <span className="truncate">Präsentation ferti...</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-[8px] font-bold flex-shrink-0">H</span>
          <span className="truncate">Code Review Tea...</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[8px] font-bold flex-shrink-0">N</span>
          <span className="truncate">Newsletter verse...</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[9px] text-gray-400 mt-auto">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          vor 10m
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileTasksCard;
