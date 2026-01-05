import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Building2 } from 'lucide-react';

export interface EmployeeTrainingGap {
  id: string;
  name: string;
  department: string;
  location: string;
  overdueCount: number;
  missingTrainings: string[];
}

interface EmployeeGapCardProps {
  employee: EmployeeTrainingGap;
  onAssignTraining?: (employeeId: string) => void;
}

export const EmployeeGapCard: React.FC<EmployeeGapCardProps> = ({ 
  employee, 
  onAssignTraining 
}) => {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-full">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{employee.name}</h4>
                <Badge className="bg-red-500 text-white hover:bg-red-600">
                  {employee.overdueCount} überfällig
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {employee.location}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Fehlend:</span>{' '}
                <span className="text-muted-foreground">
                  {employee.missingTrainings.join(', ')}
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAssignTraining?.(employee.id)}
          >
            Schulung zuweisen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
