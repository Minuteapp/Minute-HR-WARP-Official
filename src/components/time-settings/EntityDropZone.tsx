import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserCheck } from 'lucide-react';
import { DropZoneContainer } from './DragAndDropContainer';
import { EntityReference, TimePolicy } from '@/types/time-settings';
import { cn } from '@/lib/utils';

interface EntityDropZoneProps {
  entity: EntityReference;
  onPolicyDrop: (policy: TimePolicy, entity: EntityReference) => void;
  className?: string;
}

export const EntityDropZone: React.FC<EntityDropZoneProps> = ({
  entity,
  onPolicyDrop,
  className
}) => {
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'company':
        return Building2;
      case 'department':
        return Users;
      case 'team':
        return UserCheck;
      default:
        return Users;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-700';
      case 'department':
        return 'bg-green-100 text-green-700';
      case 'team':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'company':
        return 'Unternehmen';
      case 'department':
        return 'Abteilung';
      case 'team':
        return 'Team';
      default:
        return 'Einheit';
    }
  };

  const EntityIcon = getEntityIcon(entity.type);

  return (
    <DropZoneContainer
      zone={{
        id: entity.id,
        type: 'entity_drop_zone',
        accepts: ['time_policy'],
        data: entity
      }}
      onDrop={(dragItem, dropZone) => {
        if (dragItem.type === 'time_policy') {
          onPolicyDrop(dragItem.data as TimePolicy, entity);
        }
      }}
      className={cn("min-h-[120px]", className)}
    >
      <Card className="h-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EntityIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-medium">{entity.name}</CardTitle>
            </div>
            <Badge className={cn("text-xs", getEntityColor(entity.type))}>
              {getEntityLabel(entity.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center min-h-[60px] text-sm text-muted-foreground text-center">
            <div>
              <div className="mb-2">Richtlinien hier ablegen</div>
              <div className="text-xs opacity-75">
                Drag & Drop zum Zuweisen
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DropZoneContainer>
  );
};