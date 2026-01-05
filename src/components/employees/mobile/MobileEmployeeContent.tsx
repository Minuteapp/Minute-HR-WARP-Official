import { Info } from 'lucide-react';

interface MobileEmployeeContentProps {
  employee: any;
  employeeId: string;
}

export const MobileEmployeeContent = ({ employee, employeeId }: MobileEmployeeContentProps) => {
  // Arbeitszeitmodell aus echten Daten ableiten
  const getWorkTimeModel = () => {
    if (!employee.employment_type && !employee.working_hours) return null;
    const type = employee.employment_type === 'full_time' ? 'Vollzeit' : 
                 employee.employment_type === 'part_time' ? 'Teilzeit' : 
                 employee.employment_type || '';
    const hours = employee.working_hours ? `(${employee.working_hours}h/Woche)` : '';
    return `${type} ${hours}`.trim() || null;
  };

  const workTimeModel = getWorkTimeModel();
  const vacationDays = employee.vacation_days;

  return (
    <div className="space-y-3">
      {/* Organisatorisch */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <h3 className="text-[14px] font-semibold mb-3">Organisatorisch</h3>
        
        <div className="space-y-2">
          <div>
            <div className="text-[11px] font-medium mb-1.5">Aktuelle Projekte</div>
            <div className="text-[12px] text-muted-foreground">Keine Projekte zugewiesen</div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium mb-1">Offene Aufgaben</div>
            <div className="text-[12px] text-muted-foreground">—</div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium mb-1">Roadmap-Beteiligung</div>
            <div className="text-[12px] text-muted-foreground">—</div>
          </div>
        </div>
      </div>

      {/* Zeit & Abwesenheiten */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <h3 className="text-[14px] font-semibold mb-3">Zeit & Abwesenheiten</h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-muted-foreground mb-0.5">Arbeitszeitmodell</div>
            <div className="text-[12px] font-medium">
              {workTimeModel || 'Nicht hinterlegt'}
            </div>
          </div>
          
          {vacationDays !== undefined && vacationDays !== null && (
            <div>
              <div className="text-[11px] text-muted-foreground mb-0.5">Resturlaub</div>
              <div className="text-[12px] font-medium">{vacationDays} Tage</div>
            </div>
          )}
          
          {!vacationDays && (
            <div>
              <div className="text-[11px] text-muted-foreground mb-0.5">Resturlaub</div>
              <div className="text-[12px] font-medium">Nicht hinterlegt</div>
            </div>
          )}
        </div>
      </div>

      {/* Performance & Ziele - Empty State */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <h3 className="text-[14px] font-semibold mb-3">Performance & Ziele</h3>
        
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <Info className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-[11px] text-muted-foreground">
            Keine Ziele oder Performance-Daten hinterlegt.
          </p>
        </div>
      </div>
    </div>
  );
};
