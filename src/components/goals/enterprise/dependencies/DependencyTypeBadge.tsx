import { Badge } from "@/components/ui/badge";

interface DependencyTypeBadgeProps {
  type: 'blocks' | 'enables' | 'influences';
}

export const DependencyTypeBadge = ({ type }: DependencyTypeBadgeProps) => {
  const config = {
    blocks: {
      label: "Blockiert",
      className: "bg-destructive/10 text-destructive border-destructive/20"
    },
    enables: {
      label: "Ermöglicht",
      className: "bg-green-100 text-green-700 border-green-200"
    },
    influences: {
      label: "Beeinflusst",
      className: "bg-blue-100 text-blue-700 border-blue-200"
    }
  };

  const { label, className } = config[type];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
