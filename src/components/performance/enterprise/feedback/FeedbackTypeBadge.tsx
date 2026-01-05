import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface FeedbackTypeBadgeProps {
  type: 'manager_to_employee' | 'self_reflection' | 'peer' | 'upward';
}

export const FeedbackTypeBadge = ({ type }: FeedbackTypeBadgeProps) => {
  const config: Record<string, { label: string; icon?: boolean; className: string }> = {
    manager_to_employee: { 
      label: 'Vorgesetzter → Mitarbeiter', 
      icon: true,
      className: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    self_reflection: { 
      label: 'Selbstreflexion', 
      className: 'bg-purple-50 text-purple-700 border-purple-200' 
    },
    peer: { 
      label: 'Peer-Feedback', 
      className: 'bg-green-50 text-green-700 border-green-200' 
    },
    upward: { 
      label: 'Mitarbeiter → Vorgesetzter', 
      icon: true,
      className: 'bg-orange-50 text-orange-700 border-orange-200' 
    }
  };

  const { label, className } = config[type] || { label: type, className: 'bg-gray-50 text-gray-700' };

  return (
    <Badge variant="outline" className={`${className} text-xs`}>
      {label}
    </Badge>
  );
};
