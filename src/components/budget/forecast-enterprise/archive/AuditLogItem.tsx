import React from 'react';
import { FileEdit, CheckCircle, Building, BarChart3, ArrowRight } from 'lucide-react';

interface AuditLogItemProps {
  actionType: string;
  actionDescription: string;
  targetName: string;
  targetType: string;
  performedBy: string;
  performedByRole: string;
  createdAt: string;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'budget_updated': return FileEdit;
    case 'forecast_approved': return CheckCircle;
    case 'cost_center_created': return Building;
    case 'deviation_analyzed': return BarChart3;
    default: return FileEdit;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'budget_updated': return 'bg-blue-100 text-blue-600';
    case 'forecast_approved': return 'bg-green-100 text-green-600';
    case 'cost_center_created': return 'bg-purple-100 text-purple-600';
    case 'deviation_analyzed': return 'bg-orange-100 text-orange-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case 'budget_updated': return 'Budget aktualisiert';
    case 'forecast_approved': return 'Forecast genehmigt';
    case 'cost_center_created': return 'Kostenstelle erstellt';
    case 'deviation_analyzed': return 'Abweichung analysiert';
    default: return actionType;
  }
};

export const AuditLogItem: React.FC<AuditLogItemProps> = ({
  actionType,
  actionDescription,
  targetName,
  performedBy,
  performedByRole,
  createdAt
}) => {
  const Icon = getActionIcon(actionType);
  const colorClass = getActionColor(actionType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
      <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground">{getActionLabel(actionType)}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-primary font-medium truncate">{targetName}</span>
        </div>
        <p className="text-sm text-muted-foreground">{actionDescription}</p>
      </div>
      <div className="text-right text-sm flex-shrink-0">
        <p className="font-medium text-foreground">{performedBy}</p>
        <p className="text-muted-foreground">{performedByRole}</p>
        <p className="text-muted-foreground">{formatDate(createdAt)}</p>
      </div>
    </div>
  );
};
