
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addDays, format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertCircle, ArrowRight, CheckCircle2, RefreshCw, User, UserX } from 'lucide-react';
import { useShiftPlanning } from '@/hooks/useShiftPlanning';
import AbsenceIndicator from './AbsenceIndicator';
import { absenceService } from '@/services/absenceService';
import { toast } from 'sonner';

type AbsenceInfo = {
  id: string;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  user_id?: string; // Hinzugefügt für Kompatibilität
  employee_id?: string; // Hinzugefügt für Kompatibilität
};

type ShiftStatus = 'ok' | 'unassigned' | 'conflict' | 'absence';

const ShiftMonitor: React.FC = () => {
  const { shifts, shiftTypes, employees, reassignShift } = useShiftPlanning();
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<number>(7); // Tage
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [absences, setAbsences] = useState<AbsenceInfo[]>([]);
  
  // Lade Abwesenheiten für den Zeitraum
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setIsLoading(true);
        const today = startOfDay(new Date());
        const endDate = addDays(today, dateRange);
        
        // Hier würde in einer echten Anwendung ein Aufruf an den Abwesenheitsdienst erfolgen
        const response = await absenceService.getRequests();
        
        // Filtere nur genehmigte Abwesenheiten im Zeitraum
        const filteredAbsences = response.filter((absence: any) => {
          const absenceStart = new Date(absence.start_date);
          const absenceEnd = new Date(absence.end_date);
          return absence.status === 'approved' && 
                 (absenceStart <= endDate && absenceEnd >= today);
        });
        
        setAbsences(filteredAbsences);
      } catch (error) {
        console.error('Fehler beim Laden der Abwesenheiten:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAbsences();
  }, [dateRange]);
  
  // Ermittle, ob eine Schicht von einer Abwesenheit betroffen ist
  const getAbsenceForShift = (shiftDate: string, employeeId: string | undefined) => {
    if (!employeeId) return null;
    
    return absences.find(absence => {
      const absenceStartDate = new Date(absence.start_date);
      const absenceEndDate = new Date(absence.end_date);
      const shiftDateObj = new Date(shiftDate);
      
      // Verwende user_id oder employee_id, je nachdem was verfügbar ist
      const absenceEmployeeId = absence.user_id || absence.employee_id;
      
      return absenceEmployeeId === employeeId && 
             shiftDateObj >= absenceStartDate && 
             shiftDateObj <= absenceEndDate;
    });
  };
  
  // Ermittle den Status einer Schicht (ok, unassigned, conflict, absence)
  const getShiftStatus = (shift: any): ShiftStatus => {
    if (!shift.employeeId) return 'unassigned';
    
    const absence = getAbsenceForShift(shift.date, shift.employeeId);
    if (absence) return 'absence';
    
    return shift.status === 'conflict' ? 'conflict' : 'ok';
  };
  
  // Filtere Schichten basierend auf ausgewähltem Filter
  const filteredShifts = shifts.filter(shift => {
    const status = getShiftStatus(shift);
    
    switch (filter) {
      case 'conflicts':
        return status === 'conflict' || status === 'absence';
      case 'unassigned':
        return status === 'unassigned';
      case 'ok':
        return status === 'ok';
      default:
        return true;
    }
  });
  
  // Sortiere Schichten nach Datum und dann nach Status (Konflikte zuerst)
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    // Zuerst nach Datum sortieren
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    
    // Dann nach Status
    const statusA = getShiftStatus(a);
    const statusB = getShiftStatus(b);
    
    // Konflikte sollen ganz oben stehen
    if (statusA === 'conflict' && statusB !== 'conflict') return -1;
    if (statusA !== 'conflict' && statusB === 'conflict') return 1;
    
    // Dann Abwesenheiten
    if (statusA === 'absence' && statusB !== 'absence') return -1;
    if (statusA !== 'absence' && statusB === 'absence') return 1;
    
    // Dann nicht zugewiesene Schichten
    if (statusA === 'unassigned' && statusB !== 'unassigned') return -1;
    if (statusA !== 'unassigned' && statusB === 'unassigned') return 1;
    
    return 0;
  });
  
  // Finde den Schichttyp einer Schicht
  const getShiftType = (shiftTypeId: string) => {
    return shiftTypes.find(type => type.id === shiftTypeId) || { name: 'Unbekannt', start_time: '', end_time: '' };
  };
  
  // Finde einen Mitarbeiter anhand seiner ID
  const getEmployee = (employeeId: string | undefined) => {
    if (!employeeId) return { name: 'Nicht zugewiesen', department: '' };
    return employees.find(emp => emp.id === employeeId) || { name: 'Unbekannt', department: '' };
  };
  
  // Versuche, automatisch einen Ersatzmitarbeiter für eine Schicht zu finden
  const handleAutoReassign = async (shiftId: string, currentEmployeeId: string | undefined) => {
    try {
      if (!currentEmployeeId) return;
      
      const result = await reassignShift(shiftId, currentEmployeeId);
      
      if (result.success && result.newEmployee) {
        toast.success(`Schicht wurde automatisch ${result.newEmployee.name} zugewiesen`);
      } else {
        toast.error('Keine geeigneten Ersatzmitarbeiter gefunden');
      }
    } catch (error) {
      console.error('Fehler bei der automatischen Neuzuweisung:', error);
      toast.error('Fehler bei der automatischen Neuzuweisung');
    }
  };
  
  // Render-Funktion für den Status-Badge
  const renderStatusBadge = (shift: any) => {
    const status = getShiftStatus(shift);
    
    switch (status) {
      case 'ok':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            OK
          </Badge>
        );
      case 'unassigned':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            <UserX className="h-3 w-3 mr-1" />
            Nicht zugewiesen
          </Badge>
        );
      case 'conflict':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Konflikt
          </Badge>
        );
      case 'absence':
        const absence = getAbsenceForShift(shift.date, shift.employeeId);
        return (
          <div className="flex items-center">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <User className="h-3 w-3 mr-1" />
              Abwesend
            </Badge>
            {absence && (
              <span className="ml-2 text-xs italic text-gray-500">
                ({absence.type === 'vacation' ? 'Urlaub' : 
                   absence.type === 'sick' ? 'Krank' : 
                   absence.type === 'homeoffice' ? 'Homeoffice' : 'Abwesend'})
              </span>
            )}
          </div>
        );
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* ... Behalte den bestehenden Code bei ... */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Schichten</SelectItem>
                <SelectItem value="conflicts">Nur Konflikte</SelectItem>
                <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                <SelectItem value="ok">Nur OK-Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Nächste 3 Tage</SelectItem>
                <SelectItem value="7">Nächste 7 Tage</SelectItem>
                <SelectItem value="14">Nächste 14 Tage</SelectItem>
                <SelectItem value="30">Nächste 30 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>
      
      {sortedShifts.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Keine Schichten gefunden</AlertTitle>
          <AlertDescription>
            Es wurden keine Schichten gefunden, die den Filterkriterien entsprechen.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Schichtmonitor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Datum</TableHead>
                  <TableHead>Schicht</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedShifts.map((shift) => {
                  const shiftType = getShiftType(shift.type);
                  const employee = getEmployee(shift.employeeId);
                  const status = getShiftStatus(shift);
                  
                  return (
                    <TableRow key={shift.id} className={status !== 'ok' ? 'bg-muted/20' : ''}>
                      <TableCell className="font-medium">
                        {format(new Date(shift.date), 'dd.MM.yyyy', { locale: de })}
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(shift.date), 'EEEE', { locale: de })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{shiftType.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {shiftType.start_time} - {shiftType.end_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        {employee.department && (
                          <div className="text-xs text-muted-foreground">
                            {employee.department}
                          </div>
                        )}
                        
                        {status === 'absence' && (
                          <div className="mt-1">
                            <AbsenceIndicator 
                              date={new Date(shift.date)}
                              type={getAbsenceForShift(shift.date, shift.employeeId)?.type || 'unknown'}
                              employee={employee.name}
                              hasShiftConflict={true}
                              resolved={false}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(shift)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(status === 'conflict' || status === 'absence') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoReassign(shift.id, shift.employeeId)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Automatisch umplanen
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShiftMonitor;
