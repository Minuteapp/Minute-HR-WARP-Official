import { Badge } from "@/components/ui/badge";

interface RiskStatusBadgeProps {
  status: string;
}

export const RiskStatusBadge = ({ status }: RiskStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Offen', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
      case 'in_progress':
        return { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
      case 'mitigated':
        return { label: 'Gemindert', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
      case 'closed':
        return { label: 'Geschlossen', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
      default:
        return { label: status, className: '' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
};
