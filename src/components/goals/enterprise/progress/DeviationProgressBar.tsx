interface DeviationProgressBarProps {
  currentProgress: number;
  targetProgress: number;
}

export const DeviationProgressBar = ({ currentProgress, targetProgress }: DeviationProgressBarProps) => {
  return (
    <div className="space-y-1">
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Target line */}
        <div 
          className="absolute top-0 bottom-0 bg-gray-400 rounded-full"
          style={{ width: `${Math.min(targetProgress, 100)}%` }}
        />
        {/* Current progress */}
        <div 
          className="absolute top-0 bottom-0 bg-red-500 rounded-full"
          style={{ width: `${Math.min(currentProgress, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Ist: {currentProgress}%</span>
        <span>Soll: {targetProgress}%</span>
      </div>
    </div>
  );
};
