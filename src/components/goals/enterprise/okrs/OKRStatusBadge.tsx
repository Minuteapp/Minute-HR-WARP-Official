import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface OKRStatusBadgeProps {
  status: string;
}

export const OKRStatusBadge = ({ status }: OKRStatusBadgeProps) => {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    on_track: { 
      label: 'On Track', 
      className: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="h-3 w-3 mr-1" />
    },
    at_risk: { 
      label: 'At Risk', 
      className: 'bg-orange-100 text-orange-700',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    delayed: { 
      label: 'Verzögert', 
      className: 'bg-red-100 text-red-700',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
  };

  const { label, className, icon } = config[status] || config.on_track;

  return (
    <Badge variant="secondary" className={`${className} flex items-center`}>
      {icon}
      {label}
    </Badge>
  );
};
