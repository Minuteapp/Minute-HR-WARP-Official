import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Target, Clock, MoreVertical, TrendingUp, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface MobileGoalsWidgetProps {
  widget: DashboardWidget;
  data: WidgetData;
}

const MobileGoalsWidget: React.FC<MobileGoalsWidgetProps> = ({ widget, data }) => {
  const navigate = useNavigate();
  const color = widget.config?.mobile_config?.color || '#2c3ad1';
  const progressColor = widget.config?.mobile_config?.progress_color || color;
  const route = widget.config?.mobile_config?.route || '/goals';
  
  // Icon dynamisch laden
  const IconComponent = (Icons as any)[widget.icon || 'Target'] as LucideIcon || Target;
  
  const handleClick = () => {
    if (route) navigate(route);
  };

  const progressValue = typeof data.value === 'number' ? data.value : 0;

  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div 
          className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ 
            borderColor: color, 
            backgroundColor: `${color}1A` 
          }}
        >
          <IconComponent className="h-4.5 w-4.5" style={{ color }} />
        </div>
        
        <div className="flex gap-1.5 items-center flex-shrink-0">
          {/* Trend-Badge */}
          {data.trend && (
            <span className={`text-[11px] font-semibold ${
              data.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {data.trend.value}
            </span>
          )}
        </div>
        
        <MoreVertical className="h-4 w-4 text-gray-400 flex-shrink-0 ml-auto" />
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{widget.title}</h3>
      <div className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{progressValue}%</div>
      <p className="text-[11px] text-gray-500 mb-2.5 leading-tight">{data.label}</p>

      <div className="mb-2.5">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-full rounded-full" 
            style={{ 
              width: `${progressValue}%`,
              backgroundColor: progressColor
            }} 
          />
        </div>
      </div>

      <div className="space-y-1 mb-2.5 text-[11px] leading-tight flex-grow">
        {data.items?.map((item: any, idx: number) => (
          <div key={idx} className={item.meta === 'secondary' ? 'text-gray-400' : ''}>
            • {item.title}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400 mt-auto">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.timestamp || 'gestern'}
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileGoalsWidget;
