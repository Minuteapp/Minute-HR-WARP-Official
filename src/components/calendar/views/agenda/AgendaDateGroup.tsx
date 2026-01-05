
import React from 'react';
import { AgendaDateGroupProps } from './types';
import AgendaEventItem from './AgendaEventItem';

const AgendaDateGroup: React.FC<AgendaDateGroupProps> = ({
  dateKey,
  events,
  formatDateHeader,
  formatEventTime,
  getEventColor,
  getEventStatusIcon,
  handleCompleteTask,
  onEventClick,
  getEventIcon
}) => {
  return (
    <div key={dateKey} className="space-y-2">
      <h3 className="font-medium text-lg text-gray-900 mb-3">
        {formatDateHeader(dateKey)}
      </h3>
      
      <div className="space-y-2">
        {events.map(event => (
          <AgendaEventItem
            key={event.id}
            event={event}
            getEventColor={getEventColor}
            getEventStatusIcon={getEventStatusIcon}
            formatEventTime={formatEventTime}
            handleCompleteTask={handleCompleteTask}
            onEventClick={onEventClick}
            getEventIcon={getEventIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default AgendaDateGroup;
