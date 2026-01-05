
import React, { forwardRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, CheckCircle, Users, Trash2, GripVertical } from 'lucide-react';
import { ShiftType, Employee, ShiftAssignment } from '../../hooks/useDragDropShifts';

interface DraggableAssignmentProps {
  assignment: ShiftAssignment;
  onRemove: (assignmentId: string) => void;
}

const DraggableAssignment = forwardRef<HTMLDivElement, DraggableAssignmentProps>(
  ({ assignment, onRemove }, ref) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'assignment',
      item: { assignment },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const combinedRef = (node: HTMLDivElement) => {
      drag(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={combinedRef}
        className={`space-y-1 cursor-move transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
          <Badge className={`text-xs ${assignment.shiftType.color}`}>
            {assignment.shiftType.name}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(assignment.id);
            }}
            className="w-4 h-4 p-0 hover:bg-destructive/10 rounded flex items-center justify-center border-none bg-transparent cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground">
          <div>{assignment.shiftType.time}</div>
          {assignment.backupIds.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Backup verfügbar</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {assignment.requiredSkills.slice(0, 2).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
              {skill}
            </Badge>
          ))}
          {assignment.requiredSkills.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{assignment.requiredSkills.length - 2}
            </Badge>
          )}
        </div>
      </div>
    );
  }
);

DraggableAssignment.displayName = 'DraggableAssignment';

interface DropZoneCellProps {
  employee: Employee;
  day: string;
  assignment?: ShiftAssignment;
  onDrop: (employeeId: string, day: string, shiftType: ShiftType, sourceAssignmentId?: string) => boolean;
  onRemoveAssignment: (assignmentId: string) => void;
  canEmployeeHandleShift: (employeeId: string, shiftType: ShiftType) => boolean;
  getSkillsMatch: (employeeId: string, shiftType: ShiftType) => { matched: number; total: number; percentage: number };
}

const DropZoneCell = forwardRef<HTMLDivElement, DropZoneCellProps>(
  ({ 
    employee, 
    day, 
    assignment, 
    onDrop, 
    onRemoveAssignment,
    canEmployeeHandleShift,
    getSkillsMatch
  }, ref) => {
    const [{ isOver, canDrop, dragItem }, drop] = useDrop(() => ({
      accept: ['shift-type', 'assignment'],
      drop: (item: { shiftType?: ShiftType; assignment?: ShiftAssignment }) => {
        if (item.shiftType) {
          return onDrop(employee.id, day, item.shiftType);
        } else if (item.assignment) {
          if (item.assignment.employeeId === employee.id && item.assignment.day === day) {
            return false;
          }
          return onDrop(employee.id, day, item.assignment.shiftType, item.assignment.id);
        }
        return false;
      },
      canDrop: (item: { shiftType?: ShiftType; assignment?: ShiftAssignment }) => {
        const shiftType = item.shiftType || item.assignment?.shiftType;
        if (!shiftType) return false;
        
        if (item.assignment && item.assignment.employeeId === employee.id && item.assignment.day === day) {
          return false;
        }
        
        return employee.availability && canEmployeeHandleShift(employee.id, shiftType);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        dragItem: monitor.getItem(),
      }),
    }));

    const combinedRef = (node: HTMLDivElement) => {
      drop(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const getDropZoneStyle = () => {
      if (!isOver) return '';
      if (canDrop) return 'bg-success/10 border-success border-2 border-dashed';
      return 'bg-destructive/10 border-destructive border-2 border-dashed';
    };

    const getSkillsIndicator = () => {
      if (!dragItem) return null;
      
      const shiftType = dragItem.shiftType || dragItem.assignment?.shiftType;
      if (!shiftType) return null;
      
      const match = getSkillsMatch(employee.id, shiftType);
      
      return (
        <div className="absolute top-1 right-1 z-10">
          {match.percentage === 100 ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs text-warning">{match.matched}/{match.total}</span>
            </div>
          )}
        </div>
      );
    };

    const ManualAssignmentDialog = () => {
      const [selectedShift, setSelectedShift] = React.useState('');
      
      const shiftOptions = [
        { value: 'früh', label: 'Frühschicht (06:00-14:00)', skills: ['Grundqualifikation', 'Maschinenbedienung'] },
        { value: 'spät', label: 'Spätschicht (14:00-22:00)', skills: ['Wartung', 'Qualitätskontrolle'] },
        { value: 'nacht', label: 'Nachtschicht (22:00-06:00)', skills: ['Nachtwache', 'Notfallprotokoll'] },
        { value: 'turbine', label: 'Turbine A Betrieb', skills: ['Turbine A Zertifikat', 'Überwachung'] }
      ];

      return (
        <Dialog>
          <DialogTrigger asChild>
            <div 
              className="w-full h-full min-h-10 flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 rounded p-2 border border-dashed border-border"
              role="button"
              tabIndex={0}
            >
              Hier zuteilen oder ziehen
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schicht zuweisen - {employee.name}</DialogTitle>
              <DialogDescription>
                Wählen Sie eine Schicht für {employee.name} aus oder überprüfen Sie die Skills-Kompatibilität.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label>Mitarbeiter Skills:</label>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label>Schichttyp auswählen:</label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger>
                    <SelectValue placeholder="Schicht auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftOptions.map((shift) => {
                      const match = getSkillsMatch(employee.id, { skills: shift.skills } as ShiftType);
                      return (
                        <SelectItem key={shift.value} value={shift.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{shift.label}</span>
                            {match.percentage === 100 ? (
                              <CheckCircle className="w-4 h-4 text-success ml-2" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-warning ml-2" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedShift && (
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>
                      {(() => {
                        const shift = shiftOptions.find(s => s.value === selectedShift);
                        if (!shift) return '';
                        
                        const match = getSkillsMatch(employee.id, { skills: shift.skills } as ShiftType);
                        if (match.percentage === 100) {
                          return `✅ Mitarbeiter ist vollständig qualifiziert (${match.matched}/${match.total} Skills)`;
                        } else {
                          return `⚠️ Mitarbeiter hat nur ${match.matched}/${match.total} erforderliche Skills`;
                        }
                      })()}
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => {
                      const shift = shiftOptions.find(s => s.value === selectedShift);
                      if (shift) {
                        const mockShiftType: ShiftType = {
                          id: selectedShift,
                          name: shift.label.split(' ')[0],
                          time: shift.label.match(/\((.*?)\)/)?.[1] || '',
                          workers: 1,
                          color: 'bg-primary/10 border-primary',
                          skills: shift.skills
                        };
                        onDrop(employee.id, day, mockShiftType);
                      }
                    }}
                    className="w-full"
                  >
                    Zuweisen
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    return (
      <div 
        ref={combinedRef}
        className={`bg-background p-2 min-h-20 border border-border relative transition-all duration-200 ${getDropZoneStyle()}`}
      >
        {isOver && getSkillsIndicator()}
        
        {assignment ? (
          <DraggableAssignment 
            assignment={assignment} 
            onRemove={onRemoveAssignment}
          />
        ) : (
          <ManualAssignmentDialog />
        )}
      </div>
    );
  }
);

DropZoneCell.displayName = 'DropZoneCell';

interface WeeklyScheduleProps {
  searchFilter: string;
  employees: Employee[];
  assignments: ShiftAssignment[];
  onAssignShift: (employeeId: string, day: string, shiftType: ShiftType, sourceAssignmentId?: string) => boolean;
  onRemoveAssignment: (assignmentId: string) => void;
  getAssignmentForCell: (employeeId: string, day: string) => ShiftAssignment | undefined;
  canEmployeeHandleShift: (employeeId: string, shiftType: ShiftType) => boolean;
  getSkillsMatch: (employeeId: string, shiftType: ShiftType) => { matched: number; total: number; percentage: number };
}

export function WeeklySchedule({ 
  searchFilter, 
  employees, 
  assignments,
  onAssignShift,
  onRemoveAssignment,
  getAssignmentForCell,
  canEmployeeHandleShift,
  getSkillsMatch
}: WeeklyScheduleProps) {
  const weekDays = [
    { short: 'Mo.', date: '18.08', day: 'monday' },
    { short: 'Di.', date: '19.08', day: 'tuesday' },
    { short: 'Mi.', date: '20.08', day: 'wednesday' },
    { short: 'Do.', date: '21.08', day: 'thursday' },
    { short: 'Fr.', date: '22.08', day: 'friday' },
    { short: 'Sa.', date: '23.08', day: 'saturday' },
    { short: 'So.', date: '24.08', day: 'sunday' }
  ];

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        <h3 className="font-medium">Wochenplan ({filteredEmployees.length} Mitarbeiter)</h3>
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Ziehen Sie Schichttypen in die Zellen oder verwenden Sie die Dialoge
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden min-w-[800px]">
          <div className="bg-muted p-3 font-medium border-r">
            Mitarbeiter
          </div>
          {weekDays.map((day) => (
            <div key={day.day} className="bg-muted p-3 text-center">
              <div className="font-medium">{day.short}</div>
              <div className="text-sm text-muted-foreground">{day.date}</div>
            </div>
          ))}

          {filteredEmployees.map((employee) => [
            <div key={`${employee.id}-info`} className="bg-background p-3 border-r">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                    employee.availability ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {employee.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{employee.department}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {employee.skills.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{employee.skills.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>,
            
            ...weekDays.map((day) => (
              <DropZoneCell
                key={`${employee.id}-${day.day}`}
                employee={employee}
                day={day.day}
                assignment={getAssignmentForCell(employee.id, day.day)}
                onDrop={onAssignShift}
                onRemoveAssignment={onRemoveAssignment}
                canEmployeeHandleShift={canEmployeeHandleShift}
                getSkillsMatch={getSkillsMatch}
              />
            ))
          ])}
        </div>
      </div>
    </div>
  );
}
