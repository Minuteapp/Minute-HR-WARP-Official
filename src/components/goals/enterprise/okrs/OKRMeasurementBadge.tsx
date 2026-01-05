import { Badge } from "@/components/ui/badge";

interface OKRMeasurementBadgeProps {
  type: 'automatic' | 'manual';
}

export const OKRMeasurementBadge = ({ type }: OKRMeasurementBadgeProps) => {
  if (type === 'automatic') {
    return (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        Automatisch
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
      Manuell
    </Badge>
  );
};
