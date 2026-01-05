import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Exception {
  id: string;
  employeeName: string;
  employeeId: string;
  priority: 'hoch' | 'mittel' | 'niedrig';
  description: string;
  date: string;
  location: string;
  affectedHours: string;
  problem: string;
  details: string;
  requiredActions: string;
  status: 'offen' | 'gelöst';
}

interface ExceptionCardProps {
  exception: Exception;
  onViewDetails: (exception: Exception) => void;
  onMarkResolved: (id: string) => void;
}

const ExceptionCard = ({ exception, onViewDetails, onMarkResolved }: ExceptionCardProps) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-500 text-white hover:bg-red-600',
          icon: 'text-red-500'
        };
      case 'mittel':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-500 text-white hover:bg-yellow-600',
          icon: 'text-yellow-500'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-500 text-white hover:bg-blue-600',
          icon: 'text-blue-500'
        };
    }
  };

  const styles = getPriorityStyles(exception.priority);

  return (
    <div className={`rounded-lg border p-6 ${styles.bg}`}>
      <div className="flex items-start gap-4">
        <AlertTriangle className={`h-6 w-6 ${styles.icon} flex-shrink-0 mt-1`} />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={styles.badge}>
              {exception.priority.charAt(0).toUpperCase() + exception.priority.slice(1)}
            </Badge>
            <span className="font-semibold text-foreground">{exception.employeeName}</span>
          </div>
          <p className="text-muted-foreground">{exception.description}</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onViewDetails(exception)}
            >
              Details ansehen
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMarkResolved(exception.id)}
            >
              Als gelöst markieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionCard;
export type { Exception };
