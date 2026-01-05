import React from 'react';
import { User } from 'lucide-react';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmployeeRowProps {
  employee: {
    id: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    salary?: number;
    hire_date?: string;
    status?: string;
  };
}

export const EmployeeRow: React.FC<EmployeeRowProps> = ({ employee }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM yyyy', { locale: de });
    } catch {
      return '-';
    }
  };

  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unbekannt';

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{fullName}</p>
          <p className="text-xs text-muted-foreground">{employee.position || 'Keine Position'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-medium text-sm">{formatCurrency(employee.salary || 0)}</p>
          <p className="text-xs text-muted-foreground">
            Seit {employee.hire_date ? formatDate(employee.hire_date) : '-'}
          </p>
        </div>
        <EmployeeStatusBadge status={(employee.status as 'active' | 'inactive' | 'onboarding') || 'active'} />
      </div>
    </div>
  );
};
