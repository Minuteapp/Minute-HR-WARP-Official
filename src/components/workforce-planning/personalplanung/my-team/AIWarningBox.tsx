import { AlertTriangle } from "lucide-react";

interface AIWarningBoxProps {
  title?: string;
  description?: string;
  recommendation?: string;
  isVisible?: boolean;
}

export const AIWarningBox = ({ 
  title, 
  description, 
  recommendation,
  isVisible = false 
}: AIWarningBoxProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900">
            {title || "KI-Warnung: Unrealistische Planung erkannt"}
          </h4>
          {description && (
            <p className="text-sm text-red-800 mt-1">{description}</p>
          )}
          {recommendation && (
            <p className="text-sm text-red-800 mt-2">
              <span className="font-semibold">Empfehlung:</span> {recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
