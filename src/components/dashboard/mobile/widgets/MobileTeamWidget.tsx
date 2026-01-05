import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Users, Clock, MoreVertical, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface MobileTeamWidgetProps {
  widget: DashboardWidget;
  data: WidgetData;
}

const MobileTeamWidget: React.FC<MobileTeamWidgetProps> = ({ widget, data }) => {
  const navigate = useNavigate();
  const color = widget.config?.mobile_config?.color || '#2c3ad1';
  const route = widget.config?.mobile_config?.route || '/team';
  const showBorder = widget.config?.mobile_config?.show_border;
  const borderColor = widget.config?.mobile_config?.border_color || color;
  
  // Icon dynamisch laden
  const IconComponent = (Icons as any)[widget.icon || 'Users'] as LucideIcon || Users;
  
  const handleClick = () => {
    if (route) navigate(route);
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col ${
        showBorder ? 'border-2' : ''
      }`}
      style={showBorder ? { borderColor } : {}}
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
          {/* Haupt-Badge */}
          {data.badge && (
            <span className={`text-[11px] font-semibold ${
              data.badge.color === 'green' ? 'text-green-500' : 
              data.badge.color === 'orange' ? 'text-orange-500' : 
              data.badge.color === 'blue' ? 'text-blue-500' :
              'text-red-500'
            }`}>
              {data.badge.text}
            </span>
          )}
          
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
      <div className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{data.value}</div>
      <p className="text-[11px] text-gray-500 mb-2.5 leading-tight">{data.label}</p>

      <div className="space-y-1 mb-2.5 text-[11px] leading-tight flex-grow">
        {data.items?.slice(0, 3).map((item: any, idx: number) => (
          <div key={idx} className={item.meta === 'secondary' ? 'text-gray-400' : ''}>
            {item.title}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400 mt-auto">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.timestamp || 'live'}
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileTeamWidget;
