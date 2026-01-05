import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Upload,
  Download,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DataStatus = 'synced' | 'pending' | 'conflict' | 'uploading' | 'downloading';

interface OfflineDataStatusProps {
  status: DataStatus;
  className?: string;
  showText?: boolean;
}

export const OfflineDataStatus: React.FC<OfflineDataStatusProps> = ({
  status,
  className,
  showText = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          text: 'Gespeichert',
          variant: 'secondary' as const,
          color: 'text-success'
        };
      case 'pending':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'Ausstehend',
          variant: 'secondary' as const,
          color: 'text-warning'
        };
      case 'conflict':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'Konflikt',
          variant: 'destructive' as const,
          color: 'text-destructive'
        };
      case 'uploading':
        return {
          icon: <Upload className="h-3 w-3" />,
          text: 'Sende...',
          variant: 'secondary' as const,
          color: 'text-primary'
        };
      case 'downloading':
        return {
          icon: <Download className="h-3 w-3" />,
          text: 'Lade...',
          variant: 'secondary' as const,
          color: 'text-primary'
        };
      default:
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Unbekannt',
          variant: 'outline' as const,
          color: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "text-xs flex items-center gap-1",
        config.color,
        className
      )}
    >
      {config.icon}
      {showText && config.text}
    </Badge>
  );
};