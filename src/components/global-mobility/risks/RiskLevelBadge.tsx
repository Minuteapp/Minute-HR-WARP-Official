import { Badge } from "@/components/ui/badge";

interface RiskLevelBadgeProps {
  level: string;
}

export const RiskLevelBadge = ({ level }: RiskLevelBadgeProps) => {
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return { label: 'Kritisch', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
      case 'high':
        return { label: 'Hoch', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' };
      case 'medium':
        return { label: 'Mittel', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
      case 'low':
        return { label: 'Niedrig', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
      default:
        return { label: level, className: '' };
    }
  };

  const config = getLevelConfig(level);

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
};
