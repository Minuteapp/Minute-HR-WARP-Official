import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface MilestoneListItem {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  dueDate: Date;
  owner: string;
  deliverables: string[];
}

interface MilestoneListCardProps {
  milestone: MilestoneListItem;
}

const MilestoneListCard = ({ milestone }: MilestoneListCardProps) => {
  const statusConfig = {
    'completed': {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      label: 'Abgeschlossen',
      badgeClass: 'bg-green-100 text-green-600 border-green-200'
    },
    'in-progress': {
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      label: 'In Arbeit',
      badgeClass: 'bg-orange-100 text-orange-600 border-orange-200'
    },
    'upcoming': {
      icon: Clock,
      iconColor: 'text-gray-500',
      label: 'Bevorstehend',
      badgeClass: 'bg-gray-100 text-gray-600 border-gray-200'
    }
  };

  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  return (
    <div className="p-4 hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <StatusIcon className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{milestone.title}</h4>
            <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Fällig: {format(milestone.dueDate, 'd. MMM', { locale: de })}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{milestone.owner}</span>
            </div>
          </div>
          
          {milestone.deliverables.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Deliverables:</span>
              {milestone.deliverables.map((deliverable, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {deliverable}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneListCard;
