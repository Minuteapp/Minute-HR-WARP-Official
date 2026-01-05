
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { absenceManagementService } from '@/services/absenceManagementService';
import { useQueryClient } from '@tanstack/react-query';
import { useRolePermissions } from '@/hooks/useRolePermissions';

interface AbsenceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

export default function AbsenceRequestDialog({ open, onOpenChange, initialDate }: AbsenceRequestDialogProps) {
  const [type, setType] = useState('vacation');
  const [startDate, setStartDate] = useState<Date | undefined>(initialDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialDate);
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin, isAdmin } = useRolePermissions();
  
  const canSelectEmployee = isSuperAdmin || isAdmin;

  useEffect(() => {
    if (open && canSelectEmployee) {
      loadEmployees();
    }
  }, [open, canSelectEmployee]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      console.log('Lade Mitarbeiter für Abwesenheitsdialog...');
      const employeeData = await absenceManagementService.getEmployees();
      console.log('Mitarbeiter geladen:', employeeData);
      setEmployees(employeeData);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Mitarbeiter konnten nicht geladen werden'
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte Start- und Enddatum angeben'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: any = {
        type: type as any,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        reason,
        half_day: halfDay,
        status: 'pending'
      };

      // Nur user_id setzen wenn ein Mitarbeiter ausgewählt wurde
      if (selectedEmployeeId && selectedEmployeeId !== '') {
        requestData.user_id = selectedEmployeeId;
      }

      const result = await absenceManagementService.createRequest(requestData);

      if (result) {
        toast({
          title: 'Erfolg',
          description: 'Abwesenheitsantrag wurde erfolgreich erstellt'
        });
        
        // Reset form
        setType('vacation');
        setStartDate(undefined);
        setEndDate(undefined);
        setReason('');
        setHalfDay(false);
        setSelectedEmployeeId('');
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
        queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Antrags:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Antrag konnte nicht erstellt werden'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Abwesenheit beantragen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {canSelectEmployee && (
            <div className="space-y-2">
              <Label htmlFor="employee">Mitarbeiter (optional)</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Mitarbeiter auswählen (leer = eigener Antrag)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Eigener Antrag</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department || 'Keine Abteilung'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingEmployees && (
                <div className="text-sm text-muted-foreground">
                  Lade Mitarbeiter...
                </div>
              )}
              {employees.length > 0 && (
                <div className="text-sm text-green-600">
                  {employees.length} Mitarbeiter verfügbar
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Abwesenheitstyp wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="special_vacation">Sonderurlaub</SelectItem>
                  <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                  <SelectItem value="homeoffice">Homeoffice</SelectItem>
                  <SelectItem value="parental">Elternzeit</SelectItem>
                  <SelectItem value="business_trip">Dienstreise</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Halbtag</Label>
              <Select value={halfDay ? 'true' : 'false'} onValueChange={(value) => setHalfDay(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Ganztägig</SelectItem>
                  <SelectItem value="true">Halbtag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Begründung für die Abwesenheit..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Wird gespeichert...' : 'Antrag stellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
