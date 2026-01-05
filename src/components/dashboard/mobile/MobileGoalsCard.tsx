import { Target, Clock, MoreVertical, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileGoalsCard = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-2xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
      onClick={() => navigate('/goals')}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3ad1] bg-[#2c3ad1]/10 flex items-center justify-center flex-shrink-0">
          <Target className="h-4 w-4 text-[#2c3ad1]" />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <TrendingUp className="h-2.5 w-2.5 text-green-500" />
          <span className="text-[9px] font-semibold text-green-500">+5%</span>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </div>

      <h3 className="text-[11px] font-bold text-gray-900 mb-0.5 leading-tight">Ziele</h3>
      <div className="text-xl font-bold text-gray-900 mb-0.5 leading-tight">75%</div>
      <p className="text-[9px] text-gray-500 mb-2 leading-tight">Q4 2024 75/100</p>

      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div className="bg-[#2c3ad1] h-full rounded-full" style={{ width: '75%' }} />
        </div>
      </div>

      <div className="space-y-0.5 mb-2 text-[9px] leading-tight flex-grow">
        <div>• 3 erreicht</div>
        <div>• 1 in Arbeit</div>
        <div className="text-gray-400">+1 weitere</div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[9px] text-gray-400 mt-auto">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          gestern
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileGoalsCard;
