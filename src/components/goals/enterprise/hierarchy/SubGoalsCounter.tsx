import { ChevronRight } from "lucide-react";

interface SubGoalsCounterProps {
  count: number;
  onClick?: () => void;
}

export const SubGoalsCounter = ({ count, onClick }: SubGoalsCounterProps) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 hover:underline mt-2"
    >
      <span>↳ {count} untergeordnete Ziele</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
};
