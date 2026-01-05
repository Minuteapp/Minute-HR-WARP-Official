import { Badge } from '@/components/ui/badge';

interface ApplicationStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'Eingegangen', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  applied: { label: 'Eingegangen', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  preselection: { label: 'Vorauswahl', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  interview: { label: 'Interview', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
  assessment: { label: 'Assessment', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
  decision: { label: 'Entscheidung', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
  offer: { label: 'Angebot', className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100' },
  hired: { label: 'Eingestellt', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  rejected: { label: 'Abgelehnt', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
};

const ApplicationStatusBadge = ({ status }: ApplicationStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.new;
  
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ApplicationStatusBadge;
