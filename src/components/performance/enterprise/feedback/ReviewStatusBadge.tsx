import { Badge } from "@/components/ui/badge";

interface ReviewStatusBadgeProps {
  status: string;
}

export const ReviewStatusBadge = ({ status }: ReviewStatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Offen', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    in_progress: { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-700 border-green-200' },
    overdue: { label: 'Überfällig', className: 'bg-red-100 text-red-700 border-red-200' }
  };

  const { label, className } = config[status] || config.pending;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
