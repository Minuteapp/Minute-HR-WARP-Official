import { Badge } from '@/components/ui/badge';

interface JobStatusBadgeProps {
  status: string;
}

const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'published':
      case 'veröffentlicht':
        return {
          label: 'Veröffentlicht',
          className: 'bg-foreground text-background hover:bg-foreground/90',
        };
      case 'approved':
      case 'freigegeben':
        return {
          label: 'Freigegeben',
          className: 'bg-foreground text-background hover:bg-foreground/90',
        };
      case 'pending_approval':
      case 'in_genehmigung':
        return {
          label: 'In Genehmigung',
          className: 'bg-muted-foreground text-background hover:bg-muted-foreground/90',
        };
      case 'draft':
      case 'entwurf':
        return {
          label: 'Entwurf',
          className: 'bg-muted text-muted-foreground border border-border hover:bg-muted/80',
        };
      case 'paused':
      case 'pausiert':
        return {
          label: 'Pausiert',
          className: 'bg-muted text-muted-foreground border border-border hover:bg-muted/80',
        };
      case 'closed':
      case 'geschlossen':
        return {
          label: 'Geschlossen',
          className: 'bg-muted text-muted-foreground border border-border hover:bg-muted/80',
        };
      default:
        return {
          label: status,
          className: 'bg-muted text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default JobStatusBadge;
