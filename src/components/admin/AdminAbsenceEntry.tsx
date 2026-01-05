import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Save, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { absenceManagementService } from '@/services/absenceManagementService';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { AbsenceRequest, AbsenceType, AbsenceStatus } from '@/types/absence.types';

interface Employee {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
}

export const AdminAbsenceEntry = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [type, setType] = useState('vacation');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      setSelectedEmployee(employee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const employeeData = await absenceManagementService.getEmployees();
      setEmployees(employeeData);
      console.log('Mitarbeiter geladen:', employeeData.length);
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

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? 0.5 : diffDays;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick_leave: 'Krankmeldung',
      parental: 'Elternzeit',
      business_trip: 'Dienstreise',
      other: 'Sonstiges'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      vacation: 'bg-blue-100 text-blue-800',
      sick_leave: 'bg-red-100 text-red-800',
      parental: 'bg-purple-100 text-purple-800',
      business_trip: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedEmployee(null);
    setType('vacation');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setHalfDay(false);
    setAutoApprove(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte wählen Sie einen Mitarbeiter aus'
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte geben Sie Start- und Enddatum an'
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Startdatum muss vor dem Enddatum liegen'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Erstelle den Abwesenheitsantrag
      const requestData: Partial<AbsenceRequest> = {
        user_id: selectedEmployeeId,
        type: type as AbsenceType,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        reason: reason || `${getTypeLabel(type)} - Admin-Eintrag`,
        half_day: halfDay,
        status: (autoApprove ? 'approved' : 'pending') as AbsenceStatus,
        employee_name: selectedEmployee?.name,
        department: selectedEmployee?.department
      };

      // Wenn auto-genehmigt, setze auch die Genehmigungsdaten
      if (autoApprove) {
        requestData.approved_at = new Date().toISOString();
        // approved_by wird automatisch vom Service gesetzt
      }

      console.log('Erstelle Abwesenheitsantrag:', requestData);
      const result = await absenceManagementService.createRequest(requestData);

      if (result) {
        toast({
          title: 'Erfolgreich gespeichert!',
          description: `${getTypeLabel(type)} für ${selectedEmployee?.name} wurde ${autoApprove ? 'automatisch genehmigt und' : ''} eingetragen. ${autoApprove ? 'Kalender und Schichtplanung werden automatisch aktualisiert.' : ''}`
        });

        // Cache invalidieren für alle relevanten Queries
        queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
        queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['cross-module-events'] });
        
        // Formular zurücksetzen
        resetForm();
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler beim Speichern',
        description: 'Die Abwesenheit konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Admin: Abwesenheit für Mitarbeiter eintragen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tragen Sie Urlaub, Krankheit oder andere Abwesenheiten direkt für Ihre Mitarbeiter ein. 
          Die Daten werden automatisch in allen relevanten Systemen (Kalender, Schichtplanung) synchronisiert.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mitarbeiter-Auswahl */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Mitarbeiter auswählen *</Label>
                <Select 
                  value={selectedEmployeeId} 
                  onValueChange={setSelectedEmployeeId}
                  disabled={isLoadingEmployees}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingEmployees ? "Lade Mitarbeiter..." : "Mitarbeiter wählen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {employee.department} • {employee.position}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employees.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {employees.length} aktive Mitarbeiter verfügbar
                  </div>
                )}
              </div>

              {selectedEmployee && (
                <Card className="p-3 bg-muted/30">
                  <div className="space-y-1">
                    <div className="font-medium">{selectedEmployee.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedEmployee.email}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedEmployee.department}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedEmployee.position}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Abwesenheitsdetails */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Abwesenheitstyp *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">🏖️ Urlaub</SelectItem>
                      <SelectItem value="sick_leave">🤒 Krankmeldung</SelectItem>
                      <SelectItem value="parental">👶 Elternzeit</SelectItem>
                      <SelectItem value="business_trip">✈️ Dienstreise</SelectItem>
                      <SelectItem value="other">📋 Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Dauer</Label>
                  <Select value={halfDay ? 'half' : 'full'} onValueChange={(value) => setHalfDay(value === 'half')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Ganztägig</SelectItem>
                      <SelectItem value="half">Halbtag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Startdatum *</Label>
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
                  <Label>Enddatum *</Label>
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

              {startDate && endDate && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Berechnete Tage:</span>
                    <Badge className={getTypeColor(type)}>
                      {calculateDays()} {calculateDays() === 1 ? 'Tag' : 'Tage'}
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Grund und Optionen */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Begründung / Notizen</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Zusätzliche Informationen (optional)..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="autoApprove" className="text-sm">
                  Automatisch genehmigen
                </Label>
              </div>
              <div className="text-xs text-muted-foreground">
                {autoApprove 
                  ? "✅ Wird sofort genehmigt und im Kalender/Schichtplan synchronisiert" 
                  : "⏳ Bleibt als ausstehender Antrag"
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Formular leeren
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedEmployeeId || !startDate || !endDate}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Speichere...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Abwesenheit eintragen
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};