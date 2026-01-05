interface ImpactScoreBadgeProps {
  score: number;
}

export const ImpactScoreBadge = ({ score }: ImpactScoreBadgeProps) => {
  const getColor = () => {
    if (score >= 70) return "bg-green-500 text-white";
    if (score >= 40) return "bg-blue-500 text-white";
    return "bg-gray-400 text-white";
  };

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getColor()}`}>
      {score}
    </div>
  );
};
