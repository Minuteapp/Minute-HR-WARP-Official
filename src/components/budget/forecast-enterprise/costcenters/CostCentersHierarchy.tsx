import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CostCenterRow } from './CostCenterRow';

interface CostCenter {
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
}

interface CostCentersHierarchyProps {
  costCenters: CostCenter[];
}

export const CostCentersHierarchy: React.FC<CostCentersHierarchyProps> = ({ costCenters }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kostenstellenhierarchie (bis Mitarbeiter-Ebene)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {costCenters.length > 0 ? (
          costCenters.map(costCenter => (
            <CostCenterRow key={costCenter.id} costCenter={costCenter} />
          ))
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Keine Kostenstellen gefunden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
