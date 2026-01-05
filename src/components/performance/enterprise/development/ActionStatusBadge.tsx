import { Badge } from "@/components/ui/badge";

interface ActionStatusBadgeProps {
  status: string;
}

export const ActionStatusBadge = ({ status }: ActionStatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    in_progress: { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-700 border-green-200' }
  };

  const { label, className } = config[status] || config.in_progress;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};
