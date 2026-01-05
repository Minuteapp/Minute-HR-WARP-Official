
import { CheckCircle, XCircle } from "lucide-react";

interface CompanyStatusIndicatorProps {
  isActive: boolean;
}

export const CompanyStatusIndicator = ({ isActive }: CompanyStatusIndicatorProps) => {
  return isActive ? (
    <div className="flex items-center text-green-600">
      <CheckCircle className="h-4 w-4 mr-1" />
      <span>Aktiv</span>
    </div>
  ) : (
    <div className="flex items-center text-red-600">
      <XCircle className="h-4 w-4 mr-1" />
      <span>Inaktiv</span>
    </div>
  );
};
