import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Clock, MoreVertical, TrendingUp, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface MobileKPIWidgetProps {
  widget: DashboardWidget;
  data: WidgetData;
}

const MobileKPIWidget: React.FC<MobileKPIWidgetProps> = ({ widget, data }) => {
  const navigate = useNavigate();
  const color = widget.config?.mobile_config?.color || '#2c3ad1';
  const route = widget.config?.mobile_config?.route || '/';
  
  // Icon dynamisch laden
  const IconComponent = (Icons as any)[widget.icon || 'Clock'] as LucideIcon || Clock;
  
  const handleClick = () => {
    if (route) navigate(route);
  };

  // Vorschau-Tag für Zeiterfassung
  const showPreviewTag = widget.config?.mobile_config?.show_preview_tag;

  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col relative"
      onClick={handleClick}
    >
      {/* Vorschau-Tag */}
      {showPreviewTag && (
        <div className="absolute -top-2 -right-2 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-semibold">
          Vorschau
        </div>
      )}

      <div className="flex items-start justify-between mb-2.5">
        <div 
          className="w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ 
            borderColor: color, 
            backgroundColor: `${color}1A` // 10% opacity
          }}
        >
          <IconComponent className="h-4.5 w-4.5" style={{ color }} />
        </div>
        
        <div className="flex gap-1.5 items-center flex-shrink-0">
          {/* Haupt-Badge: "Live", "Online", "Heute", "Neu" */}
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
          
          {/* Trend-Badge: "+15m", "80%", "+2", "+5%" */}
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

      {data.chart_data && (
        <div className="mb-2.5">
          <div className="flex items-end gap-1 h-8">
            {data.chart_data.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="flex-1 bg-gray-200 rounded-sm"
                style={{ height: `${(item.value / 10) * 100}%` }}
              >
                <div 
                  className="w-full rounded-sm"
                  style={{ 
                    height: '100%', 
                    backgroundColor: color 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400 mt-auto">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {data.timestamp || 'gerade eben'}
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileKPIWidget;
