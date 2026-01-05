
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { AgendaEventItemProps } from './types';

const AgendaEventItem: React.FC<AgendaEventItemProps> = ({
  event,
  getEventColor,
  getEventStatusIcon,
  formatEventTime,
  handleCompleteTask,
  onEventClick,
  getEventIcon
}) => {
  return (
    <div 
      key={event.id}
      className={`p-3 rounded-md border ${getEventColor(event.type)} hover:shadow-sm transition-shadow cursor-pointer`}
      onClick={() => onEventClick && onEventClick(event)}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {getEventIcon ? getEventIcon(event.type) : null}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              {event.title}
              {getEventStatusIcon(event)}
            </h4>
            
            {event.type === 'task' && event.completed !== true && (
              <Checkbox 
                checked={false}
                onClick={(e) => handleCompleteTask(event, e as unknown as React.MouseEvent)}
              />
            )}
          </div>
          <p className="text-sm text-gray-600">{formatEventTime(event)}</p>
          {event.location && (
            <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
          )}
          {event.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaEventItem;
