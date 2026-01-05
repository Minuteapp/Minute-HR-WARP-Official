import { Badge } from '@/components/ui/badge';

interface ProjectStatusBadgeProps {
  status: 'active' | 'at-risk' | 'delayed' | 'on-hold' | 'completed' | 'planning' | 'pending';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Aktiv',
    className: 'bg-green-100 text-green-600 border border-green-200',
  },
  'at-risk': {
    label: 'At Risk',
    className: 'bg-red-100 text-red-600 border border-red-200',
  },
  delayed: {
    label: 'Verspätet',
    className: 'bg-red-100 text-red-600 border border-red-200',
  },
  'on-hold': {
    label: 'On Hold',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  completed: {
    label: 'Abgeschlossen',
    className: 'bg-green-100 text-green-600 border border-green-200',
  },
  planning: {
    label: 'Planung',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  pending: {
    label: 'Ausstehend',
    className: 'bg-yellow-100 text-yellow-600 border border-yellow-200',
  },
};

const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.planning;
  
  return (
    <Badge className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default ProjectStatusBadge;
