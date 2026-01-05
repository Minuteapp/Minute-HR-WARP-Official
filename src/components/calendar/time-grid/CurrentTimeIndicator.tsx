
interface CurrentTimeIndicatorProps {
  currentTime: number | null;
}

const CurrentTimeIndicator = ({ currentTime }: CurrentTimeIndicatorProps) => {
  if (currentTime === null) return null;

  return (
    <div 
      className="absolute left-0 right-0 border-t-2 border-blue-500 z-10"
      style={{ top: `${currentTime * 60}px` }}
    >
      <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-blue-500"></div>
    </div>
  );
};

export default CurrentTimeIndicator;
