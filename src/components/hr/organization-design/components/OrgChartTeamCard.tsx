import { Layers } from "lucide-react";

interface OrgChartTeamCardProps {
  teamCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export const OrgChartTeamCard = ({ teamCount, expanded, onToggle }: OrgChartTeamCardProps) => {
  return (
    <button
      className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-all min-w-[240px] text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <Layers className="h-8 w-8 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-900">{teamCount} Teams</p>
          <p className="text-sm text-blue-700">
            {expanded ? 'Klicken um zu reduzieren' : 'Klicken um zu erweitern'}
          </p>
        </div>
      </div>
    </button>
  );
};
