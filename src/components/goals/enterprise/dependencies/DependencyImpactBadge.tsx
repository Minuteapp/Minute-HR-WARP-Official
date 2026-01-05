import { Badge } from "@/components/ui/badge";

interface DependencyImpactBadgeProps {
  level: 'low' | 'medium' | 'high';
}

export const DependencyImpactBadge = ({ level }: DependencyImpactBadgeProps) => {
  const config = {
    low: {
      label: "Impact: Niedrig",
      className: "bg-green-100 text-green-700 border-green-200"
    },
    medium: {
      label: "Impact: Mittel",
      className: "bg-orange-100 text-orange-700 border-orange-200"
    },
    high: {
      label: "Impact: Hoch",
      className: "bg-destructive/10 text-destructive border-destructive/20"
    }
  };

  const { label, className } = config[level];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
