
import { DayContent } from "react-day-picker";

export interface CalendarDayComponentProps {
  date: Date;
  calculateHoursForDay: (date: Date) => number;
  getDayClassNames: (date: Date) => string;
  className?: string;
  activeModifiers?: Record<string, true>;
  displayMonth?: Date;
}

export const CalendarDayComponent = ({
  date,
  calculateHoursForDay,
  getDayClassNames,
  className,
  activeModifiers = {},
  ...props
}: CalendarDayComponentProps) => {
  const hours = calculateHoursForDay(date);
  const dayClassName = getDayClassNames(date);

  return (
    <div className={`relative flex flex-col items-center justify-center h-9 w-9 ${className}`}>
      <DayContent 
        date={date} 
        activeModifiers={activeModifiers} 
        displayMonth={props.displayMonth}
      />
      {hours > 0 && (
        <div className="absolute bottom-0 text-[9px] leading-none font-medium text-gray-600">
          {hours.toFixed(1)}h
        </div>
      )}
    </div>
  );
};
