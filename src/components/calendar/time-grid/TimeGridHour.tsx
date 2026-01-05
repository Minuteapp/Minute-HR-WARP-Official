
interface TimeGridHourProps {
  hour: number;
}

const TimeGridHour = ({ hour }: TimeGridHourProps) => {
  return (
    <div className="relative h-32">
      <div className="absolute top-0 -mt-3 text-sm text-gray-500 font-medium">
        {`${hour.toString().padStart(2, '0')}:00`}
      </div>
      <div className="h-full border-t border-gray-200"></div>
    </div>
  );
};

export default TimeGridHour;
