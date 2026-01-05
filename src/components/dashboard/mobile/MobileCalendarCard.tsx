import { Calendar, Clock, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileCalendarCard = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/80 cursor-pointer hover:shadow-xl hover:border-white transition-all h-full flex flex-col"
      onClick={() => navigate('/calendar')}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3ad1] bg-[#2c3ad1]/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="h-4 w-4 text-[#2c3ad1]" />
        </div>
        <span className="text-[9px] font-semibold text-orange-500 flex-shrink-0">Heute</span>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </div>

      <h3 className="text-[11px] font-bold text-gray-700 mb-0.5 leading-tight">Kalender</h3>
      <div className="text-2xl font-bold text-gray-900 mb-0.5 leading-tight">3 Termine</div>
      <p className="text-[9px] text-gray-500 mb-2 leading-tight">Nächster: in 15m</p>

      {/* Progress */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>Termine heute</span>
          <span className="font-semibold">1/3 erledigt</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-900 h-full rounded-full" style={{ width: '33%' }} />
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-1 mb-2 text-[9px] leading-tight flex-grow">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>Team Meeting</span>
          <span className="ml-auto text-gray-600">10:00</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B7EFF]"></span>
          <span>Kundentermin</span>
          <span className="ml-auto text-gray-600">14:30</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Review</span>
          <span className="ml-auto text-gray-600">16:00</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[9px] text-gray-400 mt-auto">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          vor 1m
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileCalendarCard;
