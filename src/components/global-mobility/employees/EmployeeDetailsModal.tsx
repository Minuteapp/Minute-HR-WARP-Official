
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Users } from 'lucide-react';
import { ContractStatusBadge } from './ContractStatusBadge';

interface EmployeeFamily {
  id: string;
  request_id: string | null;
  contract_status: string | null;
  employment_model: string | null;
  work_time_model: string | null;
  family_members_count: number | null;
  created_at: string | null;
  request?: {
    employee_name: string | null;
    current_location: string | null;
    destination_location: string | null;
  };
}

interface EmployeeDetailsModalProps {
  employee: EmployeeFamily | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailsModal({ employee, open, onOpenChange }: EmployeeDetailsModalProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {employee.request?.employee_name || 'Mitarbeiter Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Aktueller Standort
              </div>
              <p className="font-medium">{employee.request?.current_location || '-'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Zielstandort
              </div>
              <p className="font-medium">{employee.request?.destination_location || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Vertragsstatus
              </div>
              {employee.contract_status ? (
                <ContractStatusBadge status={employee.contract_status} />
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Beschäftigungsmodell
              </div>
              <p className="font-medium">{employee.employment_model || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Arbeitszeitmodell</div>
              <p className="font-medium">{employee.work_time_model || '-'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Familienmitglieder
              </div>
              <Badge variant="outline">{employee.family_members_count || 0}</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
