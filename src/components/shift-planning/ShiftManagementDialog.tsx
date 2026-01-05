
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import { ShiftType, Employee } from '@/types/shift-planning';
import { toast } from 'sonner';

interface ShiftManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftCreated?: () => void;
}

const ShiftManagementDialog = ({ isOpen, onOpenChange, onShiftCreated }: ShiftManagementDialogProps) => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form-Daten
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [shiftTypesData, employeesData] = await Promise.all([
        shiftPlanningService.getShiftTypes(),
        shiftPlanningService.getEmployees()
      ]);
      
      setShiftTypes(shiftTypesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      toast.error('Fehler beim Laden der Daten');
    }
  };

  const resetForm = () => {
    setSelectedShiftType('');
    setSelectedEmployee('');
    setSelectedDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
  };

  const handleShiftTypeChange = (shiftTypeId: string) => {
    setSelectedShiftType(shiftTypeId);
    
    // Automatisch Start- und Endzeiten setzen basierend auf Schichttyp
    const shiftType = shiftTypes.find(st => st.id === shiftTypeId);
    if (shiftType) {
      setStartTime(shiftType.start_time.substring(0, 5)); // HH:MM Format
      setEndTime(shiftType.end_time.substring(0, 5)); // HH:MM Format
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShiftType || !selectedEmployee || !selectedDate) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await shiftPlanningService.createShift({
        shiftTypeId: selectedShiftType,
        employeeId: selectedEmployee,
        date: selectedDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        notes: notes || undefined
      });

      if (result) {
        toast.success('Schicht erfolgreich erstellt');
        onShiftCreated?.();
        onOpenChange(false);
      } else {
        toast.error('Fehler beim Erstellen der Schicht');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Schicht:', error);
      toast.error('Fehler beim Erstellen der Schicht');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedShiftTypeData = shiftTypes.find(st => st.id === selectedShiftType);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Schicht erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Schichttyp auswählen */}
          <div className="space-y-2">
            <Label htmlFor="shiftType" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schichttyp *
            </Label>
            <Select value={selectedShiftType} onValueChange={handleShiftTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Schichttyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((shiftType) => (
                  <SelectItem key={shiftType.id} value={shiftType.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: shiftType.color }}
                      />
                      {shiftType.name} ({shiftType.start_time.substring(0, 5)} - {shiftType.end_time.substring(0, 5)})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mitarbeiter auswählen */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mitarbeiter *
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {employee.department} • {employee.position}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datum *
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          {/* Zeiten */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Startzeit</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Endzeit</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notizen
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          {/* Schichttyp-Info */}
          {selectedShiftTypeData && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <div className="font-medium flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedShiftTypeData.color }}
                />
                {selectedShiftTypeData.name}
              </div>
              <div className="text-muted-foreground mt-1">
                {selectedShiftTypeData.description}
              </div>
              <div className="text-muted-foreground">
                Besetzung: {selectedShiftTypeData.min_employees} - {selectedShiftTypeData.max_employees} Mitarbeiter
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || !selectedShiftType || !selectedEmployee || !selectedDate}
          >
            {isLoading ? 'Erstelle...' : 'Schicht erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftManagementDialog;
