import React, { forwardRef } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Users, Trash2, GripVertical } from 'lucide-react';
import { ShiftType, Employee, ShiftAssignment } from '@/hooks/useDragDropShifts';

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
        className={`space-y-1 cursor-move hover-scale animate-fade-in transition-all duration-300 ${
          isDragging ? 'opacity-50 animate-scale-out' : 'opacity-100 animate-scale-in'
        }`}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="w-3 h-3 text-muted-foreground animate-fade-in" />
          <Badge className={`text-xs ${assignment.shiftType.color.replace('bg-', 'bg-opacity-80 ')} animate-scale-in`}>
            {assignment.shiftType.name}
          </Badge>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(assignment.id);
            }}
            className="w-4 h-4 p-0 hover:bg-destructive/10 hover-scale rounded flex items-center justify-center border-none bg-transparent cursor-pointer transition-all duration-200"
          >
            <Trash2 className="w-3 h-3 transition-colors duration-200" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground animate-fade-in">
          <div>{assignment.shiftType.time}</div>
          {assignment.backupIds.length > 0 && (
            <div className="flex items-center gap-1 animate-slide-in-right">
              <Users className="w-3 h-3" />
              <span>Backup verfügbar</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 animate-fade-in">
          {assignment.requiredSkills.slice(0, 2).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs px-1 py-0 hover-scale" style={{ animationDelay: `${index * 100}ms` }}>
              {skill}
            </Badge>
          ))}
          {assignment.requiredSkills.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0 hover-scale animate-fade-in">
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
      if (canDrop) return 'bg-success/10 border-success border-2 border-dashed animate-fade-in';
      return 'bg-destructive/10 border-destructive border-2 border-dashed animate-fade-in pulse';
    };

    const getSkillsIndicator = () => {
      if (!dragItem) return null;
      
      const shiftType = dragItem.shiftType || dragItem.assignment?.shiftType;
      if (!shiftType) return null;
      
      const match = getSkillsMatch(employee.id, shiftType);
      
      return (
        <div className="absolute top-1 right-1 z-10 animate-scale-in">
          {match.percentage === 100 ? (
            <CheckCircle className="w-4 h-4 text-success animate-fade-in" />
          ) : (
            <div className="flex items-center gap-1 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-warning pulse" />
              <span className="text-xs text-warning font-medium">{match.matched}/{match.total}</span>
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
              className="w-full h-full min-h-10 flex items-center justify-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/50 hover-scale rounded p-2 border border-dashed border-border transition-all duration-300 animate-fade-in group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              <span className="group-hover:animate-fade-in">Hier zuteilen oder ziehen</span>
            </div>
          </DialogTrigger>
          <DialogContent className="animate-scale-in">
            <DialogHeader>
              <DialogTitle className="animate-fade-in">Schicht zuweisen - {employee.name}</DialogTitle>
              <DialogDescription className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                Wählen Sie eine Schicht für {employee.name} aus oder überprüfen Sie die Skills-Kompatibilität.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <label className="text-sm font-medium">Mitarbeiter Skills:</label>
                <div className="flex flex-wrap gap-1">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="hover-scale animate-fade-in" style={{ animationDelay: `${300 + (index * 50)}ms` }}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <label className="text-sm font-medium">Schichttyp auswählen:</label>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="hover-scale transition-transform duration-200">
                    <SelectValue placeholder="Schicht auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftOptions.map((shift, index) => {
                      const match = getSkillsMatch(employee.id, { skills: shift.skills } as ShiftType);
                      return (
                        <SelectItem key={shift.value} value={shift.value} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="flex items-center justify-between w-full">
                            <span>{shift.label}</span>
                            {match.percentage === 100 ? (
                              <CheckCircle className="w-4 h-4 text-success ml-2 animate-scale-in" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-warning ml-2 animate-scale-in" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedShift && (
                <div className="space-y-2 animate-fade-in">
                  <Alert className="animate-scale-in">
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
                    className="w-full hover-scale transition-transform duration-200"
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
        className={`bg-background p-2 min-h-20 border border-border relative transition-all duration-300 hover:shadow-sm animate-fade-in ${getDropZoneStyle()}`}
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

export function WeeklyScheduleAnimated({ 
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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 animate-scale-in" />
        <h3 className="font-medium animate-fade-in story-link">
          Wochenplan ({filteredEmployees.length} Mitarbeiter)
        </h3>
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded animate-fade-in hover-scale transition-transform duration-200">
          Ziehen Sie Schichttypen in die Zellen oder verwenden Sie die Dialoge
        </div>
      </div>

      <div className="overflow-x-auto animate-fade-in">
        <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden min-w-[800px] animate-scale-in">
          {/* Header */}
          <div className="bg-muted p-3 font-medium border-r animate-slide-in-right">
            Mitarbeiter
          </div>
          {weekDays.map((day, index) => (
            <div 
              key={day.day} 
              className="bg-muted p-3 text-center animate-fade-in hover-scale transition-transform duration-200" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="font-medium">{day.short}</div>
              <div className="text-sm text-muted-foreground">{day.date}</div>
            </div>
          ))}

          {/* Employee rows */}
          {filteredEmployees.map((employee, employeeIndex) => (
            <React.Fragment key={employee.id}>
              <div 
                className="bg-background p-3 border-r animate-fade-in hover-scale transition-all duration-300" 
                style={{ animationDelay: `${employeeIndex * 100}ms` }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-all duration-300 hover-scale ${
                      employee.availability ? 'bg-primary/10 text-primary animate-scale-in' : 'bg-muted text-muted-foreground'
                    }`}>
                      {employee.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm story-link">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">{employee.department}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 2).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs hover-scale animate-fade-in transition-transform duration-200" 
                        style={{ animationDelay: `${(employeeIndex * 100) + (index * 50)}ms` }}
                      >
                        {skill}
                      </Badge>
                    ))}
                    {employee.skills.length > 2 && (
                      <Badge 
                        variant="outline" 
                        className="text-xs hover-scale animate-fade-in transition-transform duration-200" 
                        style={{ animationDelay: `${(employeeIndex * 100) + 100}ms` }}
                      >
                        +{employee.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {weekDays.map((day, dayIndex) => (
                <div 
                  key={`${employee.id}-${day.day}`} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${(employeeIndex * 100) + (dayIndex * 50)}ms` }}
                >
                  <DropZoneCell
                    employee={employee}
                    day={day.day}
                    assignment={getAssignmentForCell(employee.id, day.day)}
                    onDrop={onAssignShift}
                    onRemoveAssignment={onRemoveAssignment}
                    canEmployeeHandleShift={canEmployeeHandleShift}
                    getSkillsMatch={getSkillsMatch}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}