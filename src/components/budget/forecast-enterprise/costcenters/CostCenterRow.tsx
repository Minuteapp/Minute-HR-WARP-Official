import React, { useState } from 'react';
import { ChevronRight, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CostCenterStatusBadge } from './CostCenterStatusBadge';
import { DepartmentBadge } from './DepartmentBadge';
import { CostCenterDetails } from './CostCenterDetails';

interface CostCenterRowProps {
  costCenter: {
    id: string;
    name: string;
    code?: string;
    department?: string;
    responsible_person?: string;
    employee_count?: number;
    planned_amount?: number;
    forecast_amount?: number;
    status?: string;
    total_personnel_cost?: number;
    team_count?: number;
    average_salary?: number;
  };
}

export const CostCenterRow: React.FC<CostCenterRowProps> = ({ costCenter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  const StatusIcon = costCenter.status === 'critical' ? AlertTriangle :
                     costCenter.status === 'warning' ? AlertCircle : CheckCircle;
  
  const statusColor = costCenter.status === 'critical' ? 'text-red-500' :
                      costCenter.status === 'warning' ? 'text-orange-500' : 'text-green-500';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-4 px-4 hover:bg-muted/50 transition-colors border-b border-border">
          <div className="flex items-center gap-3">
            <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium">{costCenter.name}</span>
                {costCenter.code && (
                  <span className="text-xs text-muted-foreground">({costCenter.code})</span>
                )}
                {costCenter.department && (
                  <DepartmentBadge department={costCenter.department} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Verantwortlich: {costCenter.responsible_person || 'Nicht zugewiesen'} • {costCenter.employee_count || 0} Mitarbeiter
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-medium">{formatCurrency(costCenter.planned_amount || 0)}</p>
              <p className="text-xs text-muted-foreground">Budget</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(costCenter.forecast_amount || 0)}</p>
              <p className="text-xs text-muted-foreground">Forecast</p>
            </div>
            <CostCenterStatusBadge status={(costCenter.status as 'normal' | 'warning' | 'critical') || 'normal'} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CostCenterDetails costCenter={costCenter} />
      </CollapsibleContent>
    </Collapsible>
  );
};
