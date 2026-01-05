import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AbsenceRequest } from '@/types/absence.types';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';

interface AbsenceTypesChartProps {
  absences: AbsenceRequest[];
}

export const AbsenceTypesChart: React.FC<AbsenceTypesChartProps> = ({ absences }) => {
  const { getTypeLabel } = useAbsenceManagement();

  const typeCounts = absences.reduce((acc, absence) => {
    acc[absence.type] = (acc[absence.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = absences.length;

  const typeData = [
    { type: 'vacation', label: 'Urlaub', color: 'bg-blue-600', count: typeCounts.vacation || 0 },
    { type: 'sick_leave', label: 'Krankheit', color: 'bg-red-600', count: typeCounts.sick_leave || 0 },
    { type: 'business_trip', label: 'Homeoffice', color: 'bg-green-600', count: typeCounts.business_trip || 0 },
    { type: 'other', label: 'Sonderurlaub', color: 'bg-orange-600', count: typeCounts.other || 0 }
  ];

  // Nur echte Daten anzeigen
  const displayTotal = total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Abwesenheitsarten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {typeData.map((item) => {
            const percentage = displayTotal > 0 ? Math.round((item.count / displayTotal) * 100) : 0;
            return (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground font-semibold">
                    {item.count} <span className="text-xs">({percentage}%)</span>
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2.5"
                  indicatorClassName={item.color}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
