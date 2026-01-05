import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Settings } from 'lucide-react';
import { DraggableItem } from './DragAndDropContainer';
import { TimePolicy } from '@/types/time-settings';
import { cn } from '@/lib/utils';

interface PolicyCardProps {
  policy: TimePolicy;
  isDraggable?: boolean;
  className?: string;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  isDraggable = false,
  className
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'working_model':
        return Clock;
      case 'absence_type':
        return Calendar;
      case 'approval_flow':
        return Users;
      default:
        return Settings;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'working_model':
        return 'bg-blue-100 text-blue-700';
      case 'absence_type':
        return 'bg-green-100 text-green-700';
      case 'approval_flow':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'working_model':
        return 'Arbeitszeitmodell';
      case 'absence_type':
        return 'Abwesenheitsart';
      case 'approval_flow':
        return 'Genehmigungsprozess';
      default:
        return 'Unbekannt';
    }
  };

  const TypeIcon = getTypeIcon(policy.type);

  const policyContent = (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">{policy.title}</CardTitle>
          </div>
          <Badge className={cn("text-xs", getTypeColor(policy.type))}>
            {getTypeLabel(policy.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-2">{policy.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Gültig ab: {policy.effectiveFrom.toLocaleDateString('de-DE')}</span>
          <span>Priorität: {policy.priority}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isDraggable) {
    return (
      <DraggableItem
        item={{
          id: policy.id,
          type: 'time_policy',
          data: policy
        }}
        className={className}
      >
        {policyContent}
      </DraggableItem>
    );
  }

  return policyContent;
};