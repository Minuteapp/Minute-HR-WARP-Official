import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Check, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';

const weekDays = [
  { key: 'mo', label: 'Mo.', date: '18.08' },
  { key: 'di', label: 'Di.', date: '19.08' },
  { key: 'mi', label: 'Mi.', date: '20.08' },
  { key: 'do', label: 'Do.', date: '21.08' },
  { key: 'fr', label: 'Fr.', date: '22.08' },
  { key: 'sa', label: 'Sa.', date: '23.08' },
  { key: 'so', label: 'So.', date: '24.08' }
];

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  skills: string[];
}

interface ShiftType {
  id: string;
  name: string;
  time: string;
  color: string;
  textColor: string;
  employees: number;
  requirements: string[];
}

interface AssignShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  dayKey: string;
  shiftTypes: ShiftType[];
}

const AssignShiftDialog: React.FC<AssignShiftDialogProps> = ({ isOpen, onClose, employee, dayKey, shiftTypes }) => {
  const [selectedShiftType, setSelectedShiftType] = useState<string>('');

  if (!employee) return null;

  const handleAssign = () => {
    console.log('Assigning shift:', selectedShiftType, 'to employee:', employee.id, 'on day:', dayKey);
    onClose();
    setSelectedShiftType('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            Schicht zuweisen - {employee.name}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Wählen Sie eine Schicht für {employee.name} aus.
            </p>
            
            <div>
              <label className="text-sm font-medium">Mitarbeiter Skills:</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {employee.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Schichttyp auswählen:</label>
            <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Schicht auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {shiftTypes.map((shiftType) => (
                  <SelectItem key={shiftType.id} value={shiftType.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${shiftType.color}`} />
                      <span>{shiftType.name} ({shiftType.time})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={!selectedShiftType}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Zuweisen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CalendarView: React.FC = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    dayKey: string;
  }>({
    isOpen: false,
    employee: null,
    dayKey: ''
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['calendar-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .limit(20);
      if (error) throw error;
      return (data || []).map(e => ({
        id: e.id,
        name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Unbekannt',
        department: e.department || 'Allgemein',
        position: e.position || '',
        skills: []
      })) as Employee[];
    },
    enabled: !!companyId
  });

  const { data: shiftTypes = [], isLoading: loadingShiftTypes } = useQuery({
    queryKey: ['shift-types', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('company_id', companyId);
      if (error) {
        console.log('shift_types query error:', error.message);
        return [];
      }
      return (data || []).map(s => ({
        id: s.id,
        name: s.name || 'Schicht',
        time: `${s.start_time || '00:00'} - ${s.end_time || '00:00'}`,
        color: s.color || 'bg-blue-500',
        textColor: 'text-white',
        employees: 0,
        requirements: []
      })) as ShiftType[];
    },
    enabled: !!companyId
  });

  const handleCellClick = (employee: Employee, dayKey: string) => {
    setDialogState({
      isOpen: true,
      employee,
      dayKey
    });
  };

  const closeDialog = () => {
    setDialogState({
      isOpen: false,
      employee: null,
      dayKey: ''
    });
  };

  const isLoading = loadingEmployees || loadingShiftTypes;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Shift Types */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" id="availableShifts" className="rounded" defaultChecked />
          <label htmlFor="availableShifts" className="text-sm font-medium">
            Verfügbare Schichttypen ziehen
          </label>
        </div>
        
        {shiftTypes.length === 0 ? (
          <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Keine Schichttypen definiert</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {shiftTypes.map((shiftType) => (
              <Card key={shiftType.id} className={`${shiftType.color} border-none cursor-grab hover:shadow-md transition-shadow`}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${shiftType.textColor}`}>{shiftType.name}</h4>
                    </div>
                    <div className={`text-xs ${shiftType.textColor}`}>
                      {shiftType.time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Schedule */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">📅 Wochenplan ({employees.length} Mitarbeiter)</span>
        </div>

        {employees.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Keine Mitarbeiter vorhanden</p>
                <p className="text-sm text-muted-foreground mt-1">Fügen Sie Mitarbeiter hinzu, um den Schichtplan zu nutzen</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium w-48">Mitarbeiter</th>
                      {weekDays.map((day) => (
                        <th key={day.key} className="text-center p-3 font-medium min-w-32">
                          <div>
                            <div>{day.label}</div>
                            <div className="text-xs text-muted-foreground">{day.date}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-sm">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.department}</div>
                            <div className="text-xs text-muted-foreground">{employee.position}</div>
                          </div>
                        </td>
                        {weekDays.map((day) => (
                          <td key={day.key} className="p-2">
                            <div 
                              className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
                              onClick={() => handleCellClick(employee, day.key)}
                            >
                              <span className="text-xs text-gray-400">Zuteilen</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AssignShiftDialog 
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        employee={dialogState.employee}
        dayKey={dialogState.dayKey}
        shiftTypes={shiftTypes}
      />
    </div>
  );
};
