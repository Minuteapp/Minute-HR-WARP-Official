import { AlertTriangle } from "lucide-react";

interface MeasureRisksBoxProps {
  risks: string[];
}

export const MeasureRisksBox = ({ risks }: MeasureRisksBoxProps) => {
  if (risks.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-sm font-medium text-yellow-800">Risiken</span>
          <ul className="mt-1 space-y-0.5">
            {risks.map((risk, index) => (
              <li key={index} className="text-sm text-orange-600">
                • {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
