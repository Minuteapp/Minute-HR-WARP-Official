
import { useState, useEffect } from "react";
import DatePicker from "./date-time/DatePicker";
import TimePicker from "./date-time/TimePicker";

interface DateTimePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  isAllDay?: boolean;
}

const DateTimePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isAllDay = false
}: DateTimePickerProps) => {
  // Fix für nicht initialisierte Daten
  useEffect(() => {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      onStartDateChange(new Date());
    }
    
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      onEndDateChange(new Date(new Date().getTime() + 60 * 60 * 1000));
    }
  }, [startDate, endDate, onStartDateChange, onEndDateChange]);

  // Sicherstellen, dass wir ein gültiges Datum für die Anzeige haben
  const safeStartDate = startDate instanceof Date && !isNaN(startDate.getTime()) 
    ? startDate 
    : new Date();
    
  const safeEndDate = endDate instanceof Date && !isNaN(endDate.getTime()) 
    ? endDate 
    : new Date(new Date().getTime() + 60 * 60 * 1000);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <DatePicker 
          date={safeStartDate} 
          onChange={onStartDateChange}
          label="Startdatum"
        />
        
        <DatePicker 
          date={safeEndDate} 
          onChange={onEndDateChange}
          label="Enddatum"
        />
      </div>
      
      {!isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <TimePicker 
            date={safeStartDate} 
            onChange={onStartDateChange}
            label="Startzeit"
          />
          
          <TimePicker 
            date={safeEndDate} 
            onChange={onEndDateChange}
            label="Endzeit"
          />
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
