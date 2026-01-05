import React from 'react';
import { TimeEntry } from '@/types/time-tracking.types';

interface TimelineVisualizationProps {
  entries?: TimeEntry[];
  entry?: TimeEntry;
  date?: Date;
  compact?: boolean;
}

const TimelineVisualization = ({ entries, entry, date, compact = false }: TimelineVisualizationProps) => {
  // Wenn ein einzelner Entry übergeben wird, verwende ihn
  const displayEntries = entry ? [entry] : (entries || []);
  const startHour = 8;
  const endHour = 18;
  const totalHours = endHour - startHour;
  const pixelsPerHour = compact ? 50 : 60;
  const timelineWidth = totalHours * pixelsPerHour;

  const getPositionAndWidth = (entry: TimeEntry) => {
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const startOffset = (startMinutes - startHour * 60) / 60;
    const duration = (endMinutes - startMinutes) / 60;
    
    return {
      left: Math.max(0, startOffset * pixelsPerHour),
      width: Math.max(10, duration * pixelsPerHour)
    };
  };

  const renderBreaks = (entry: TimeEntry) => {
    if (!entry.break_minutes || entry.break_minutes === 0) return null;
    
    const { left, width } = getPositionAndWidth(entry);
    const breakWidth = (entry.break_minutes / 60) * pixelsPerHour;
    
    return (
      <div
        className="absolute h-8 bg-orange-500 rounded shadow-sm border-2 border-orange-600"
        style={{
          left: left + width - breakWidth,
          width: Math.max(breakWidth, 20),
          top: 10
        }}
        title={`Pause: ${entry.break_minutes} min`}
      >
        <span className="text-[8px] font-semibold text-white absolute inset-0 flex items-center justify-center">
          {entry.break_minutes}m
        </span>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="py-4" style={{ minWidth: timelineWidth }}>
        {/* Timeline mit mehr Höhe für Labels */}
        <div className="relative bg-gray-100 rounded-lg" style={{ width: timelineWidth, height: 90 }}>
        {/* Stunden-Marker */}
        {Array.from({ length: totalHours + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[10px] font-semibold text-gray-600"
            style={{ left: i * pixelsPerHour - 12, top: 65 }}
          >
            {(startHour + i).toString().padStart(2, '0')}:00
          </div>
        ))}
        {/* Gitter */}
        {Array.from({ length: totalHours }).map((_, i) => (
          <div
            key={i}
            className="absolute border-l border-gray-300"
            style={{ left: i * pixelsPerHour, height: 50, top: 15 }}
          />
        ))}

        {/* Arbeitszeit-Blöcke */}
        {displayEntries.map((entry, idx) => {
          const { left, width } = getPositionAndWidth(entry);
          const startTime = new Date(entry.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
          const endTime = entry.end_time ? new Date(entry.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'Aktiv';
          
          return (
            <div key={entry.id || idx} className="relative">
              {/* Arbeitszeit-Block */}
              <div
                className="absolute h-8 bg-green-600 rounded shadow-md cursor-pointer hover:bg-green-700 transition-colors border border-green-700"
                style={{ left, width, top: 10 }}
                title={`${entry.project || 'Allgemein'}: ${startTime} - ${endTime}`}
              >
                <span className="text-[8px] font-semibold text-white absolute inset-0 flex items-center justify-center">
                  {entry.project || 'Arbeit'}
                </span>
              </div>
              
              {/* Startzeit-Label */}
              <div
                className="absolute -top-4 text-[10px] font-bold text-green-700 bg-white px-1 rounded border border-green-300"
                style={{ left: left - 2 }}
              >
                {startTime}
              </div>
              
              {/* Endzeit-Label */}
              {entry.end_time && (
                <div
                  className="absolute -top-4 text-[10px] font-bold text-red-700 bg-white px-1 rounded border border-red-300"
                  style={{ left: left + width - 20 }}
                >
                  {endTime}
                </div>
              )}
              
              {renderBreaks(entry)}
            </div>
          );
        })}

        {/* Start und End Marker */}
        {displayEntries.length > 0 && (
          <>
            <div
              className="absolute w-4 h-4 bg-green-700 rounded-full border-2 border-white shadow-lg"
              style={{ left: getPositionAndWidth(displayEntries[0]).left - 8, top: 22 }}
              title="Start"
            />
            {displayEntries[displayEntries.length - 1].end_time && (
              <div
                className="absolute w-4 h-4 bg-red-700 rounded-full border-2 border-white shadow-lg"
                style={{ left: getPositionAndWidth(displayEntries[displayEntries.length - 1]).left + getPositionAndWidth(displayEntries[displayEntries.length - 1]).width + 4, top: 22 }}
                title="Ende"
              />
            )}
          </>
        )}
      </div>

      {/* Legende */}
      {!compact && (
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded border border-green-700" />
            <span className="text-gray-700">Arbeitszeit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded border border-orange-600" />
            <span className="text-gray-700">Pause</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-700 rounded-full border border-white" />
            <span className="text-gray-700">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-700 rounded-full border border-white" />
            <span className="text-gray-700">Ende</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TimelineVisualization;
