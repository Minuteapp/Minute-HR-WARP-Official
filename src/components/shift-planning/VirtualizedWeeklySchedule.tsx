import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDrop, useDrag } from 'react-dnd';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Plus, 
  Trash2, 
  GripVertical,
  Star,
  Clock,
  MapPin,
  Building,
  Target
} from 'lucide-react';
import { ShiftType, Employee, ShiftAssignment, Location, Department, Team } from '../../hooks/useDragDropShifts';

interface VirtualizedWeeklyScheduleProps {
  employees: Employee[];
  assignments: ShiftAssignment[];
  locations: Location[];
  departments: Department[];
  teams: Team[];
  onAssignShift: (employeeId: string, day: string, shiftType: ShiftType, sourceAssignmentId?: string) => boolean;
  onRemoveAssignment: (assignmentId: string) => void;
  getAssignmentForCell: (employeeId: string, day: string) => ShiftAssignment | undefined;
  canEmployeeHandleShift: (employeeId: string, shiftType: ShiftType) => boolean;
  getSkillsMatch: (employeeId: string, shiftType: ShiftType) => { matched: number; total: number; percentage: number };
}

const ITEM_HEIGHT = 80;
const HEADER_HEIGHT = 60;
const CELL_WIDTH = 140;

interface EmployeeRowProps {
  index: number;
  style: any;
  data: {
    employees: Employee[];
    assignments: ShiftAssignment[];
    weekDays: Array<{ short: string; date: string; day: string }>;
    onAssignShift: (employeeId: string, day: string, shiftType: ShiftType, sourceAssignmentId?: string) => boolean;
    onRemoveAssignment: (assignmentId: string) => void;
    getAssignmentForCell: (employeeId: string, day: string) => ShiftAssignment | undefined;
    canEmployeeHandleShift: (employeeId: string, shiftType: ShiftType) => boolean;
    getSkillsMatch: (employeeId: string, shiftType: ShiftType) => { matched: number; total: number; percentage: number };
    locations: Location[];
    departments: Department[];
    teams: Team[];
  };
}

const DraggableAssignment = React.memo(({ assignment, onRemove }: {
  assignment: ShiftAssignment;
  onRemove: (assignmentId: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'assignment',
    item: { assignment },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`space-y-1 cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex items-center gap-1">
        <GripVertical className="w-3 h-3 text-gray-400" />
        <Badge className={`text-xs ${assignment.shiftType.color.replace('bg-', 'bg-opacity-80 ')}`}>
          {assignment.shiftType.name}
        </Badge>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(assignment.id);
          }}
          className="w-4 h-4 p-0 hover:bg-red-100 rounded flex items-center justify-center border-none bg-transparent cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="text-xs text-gray-600">
        <div>{assignment.shiftType.time}</div>
        {assignment.backupIds.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{assignment.backupIds.length} Backup</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {assignment.requiredSkills.slice(0, 2).map((skill, index) => (
          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
            {skill.length > 8 ? skill.substring(0, 8) + '...' : skill}
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
});

DraggableAssignment.displayName = 'DraggableAssignment';

const DropZoneCell = React.memo(({ 
  employee, 
  day, 
  assignment, 
  onDrop, 
  onRemoveAssignment,
  canEmployeeHandleShift,
  getSkillsMatch
}: {
  employee: Employee;
  day: string;
  assignment?: ShiftAssignment;
  onDrop: (employeeId: string, day: string, shiftType: ShiftType, sourceAssignmentId?: string) => boolean;
  onRemoveAssignment: (assignmentId: string) => void;
  canEmployeeHandleShift: (employeeId: string, shiftType: ShiftType) => boolean;
  getSkillsMatch: (employeeId: string, shiftType: ShiftType) => { matched: number; total: number; percentage: number };
}) => {
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

  const getDropZoneStyle = () => {
    if (!isOver) return '';
    if (canDrop) return 'bg-green-50 border-green-300 border-2 border-dashed';
    return 'bg-red-50 border-red-300 border-2 border-dashed';
  };

  const getSkillsIndicator = () => {
    if (!dragItem) return null;
    
    const shiftType = dragItem.shiftType || dragItem.assignment?.shiftType;
    if (!shiftType) return null;
    
    const match = getSkillsMatch(employee.id, shiftType);
    
    return (
      <div className="absolute top-1 right-1 z-10">
        {match.percentage === 100 ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600">{match.matched}/{match.total}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={drop}
      className={`bg-white p-1 h-full min-h-16 border border-gray-100 relative transition-all duration-200 ${getDropZoneStyle()}`}
      style={{ width: CELL_WIDTH }}
    >
      {isOver && getSkillsIndicator()}
      
      {assignment ? (
        <DraggableAssignment 
          assignment={assignment} 
          onRemove={onRemoveAssignment}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-gray-50 rounded border border-dashed border-gray-300">
          <Plus className="w-3 h-3" />
        </div>
      )}
    </div>
  );
});

DropZoneCell.displayName = 'DropZoneCell';

const EmployeeRow = React.memo(({ index, style, data }: EmployeeRowProps) => {
  const employee = data.employees[index];
  const location = data.locations.find(l => l.id === employee.locationId);
  const department = data.departments.find(d => d.id === employee.departmentId);
  const team = data.teams.find(t => t.id === employee.teamId);

  return (
    <div style={style} className="flex border-b border-gray-100">
      {/* Employee Info Column */}
      <div className="bg-white p-2 border-r border-gray-100 flex-shrink-0" style={{ width: 300 }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
              employee.availability ? 'bg-blue-100' : 'bg-gray-200'
            }`}>
              {employee.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{employee.name}</div>
              <div className="text-xs text-gray-600 truncate">#{employee.employeeNumber}</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: employee.performanceRating }, (_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location?.name}</span>
            <Building className="w-3 h-3 ml-1" />
            <span className="truncate">{department?.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span className="truncate">{team?.name}</span>
            <Target className="w-3 h-3 ml-1" />
            <Badge variant="outline" className="text-xs">
              {employee.role.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {employee.skills.slice(0, 2).map((skill, skillIndex) => (
              <Badge key={skillIndex} variant="outline" className="text-xs">
                {skill.length > 8 ? skill.substring(0, 8) + '...' : skill}
              </Badge>
            ))}
            {employee.skills.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{employee.skills.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Schedule Cells */}
      <div className="flex">
        {data.weekDays.map((day) => (
          <DropZoneCell
            key={`${employee.id}-${day.day}`}
            employee={employee}
            day={day.day}
            assignment={data.getAssignmentForCell(employee.id, day.day)}
            onDrop={data.onAssignShift}
            onRemoveAssignment={data.onRemoveAssignment}
            canEmployeeHandleShift={data.canEmployeeHandleShift}
            getSkillsMatch={data.getSkillsMatch}
          />
        ))}
      </div>
    </div>
  );
});

EmployeeRow.displayName = 'EmployeeRow';

export function VirtualizedWeeklySchedule({
  employees,
  assignments,
  locations,
  departments,
  teams,
  onAssignShift,
  onRemoveAssignment,
  getAssignmentForCell,
  canEmployeeHandleShift,
  getSkillsMatch
}: VirtualizedWeeklyScheduleProps) {
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'location' | 'performance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const weekDays = [
    { short: 'Mo.', date: '18.08', day: 'monday' },
    { short: 'Di.', date: '19.08', day: 'tuesday' },
    { short: 'Mi.', date: '20.08', day: 'wednesday' },
    { short: 'Do.', date: '21.08', day: 'thursday' },
    { short: 'Fr.', date: '22.08', day: 'friday' },
    { short: 'Sa.', date: '23.08', day: 'saturday' },
    { short: 'So.', date: '24.08', day: 'sunday' }
  ];

  const sortedEmployees = useMemo(() => {
    const sorted = [...employees].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'location':
          const locA = locations.find(l => l.id === a.locationId)?.name || '';
          const locB = locations.find(l => l.id === b.locationId)?.name || '';
          comparison = locA.localeCompare(locB);
          break;
        case 'performance':
          comparison = b.performanceRating - a.performanceRating;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [employees, sortBy, sortOrder, locations]);

  const itemData = useMemo(() => ({
    employees: sortedEmployees,
    assignments,
    weekDays,
    onAssignShift,
    onRemoveAssignment,
    getAssignmentForCell,
    canEmployeeHandleShift,
    getSkillsMatch,
    locations,
    departments,
    teams
  }), [
    sortedEmployees,
    assignments,
    weekDays,
    onAssignShift,
    onRemoveAssignment,
    getAssignmentForCell,
    canEmployeeHandleShift,
    getSkillsMatch,
    locations,
    departments,
    teams
  ]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-medium">Wochenplan ({employees.length.toLocaleString()} Mitarbeiter)</h3>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Ziehen Sie Schichttypen in die Zellen
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nach Name sortieren</SelectItem>
                <SelectItem value="department">Nach Abteilung sortieren</SelectItem>
                <SelectItem value="location">Nach Standort sortieren</SelectItem>
                <SelectItem value="performance">Nach Leistung sortieren</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex bg-gray-50 border-b">
            <div className="p-3 font-medium border-r" style={{ width: 300 }}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mitarbeiter
              </div>
            </div>
            {weekDays.map((day) => (
              <div key={day.day} className="p-3 text-center border-r last:border-r-0" style={{ width: CELL_WIDTH }}>
                <div className="font-medium">{day.short}</div>
                <div className="text-sm text-gray-600">{day.date}</div>
              </div>
            ))}
          </div>

          {/* Virtualized Employee List */}
          <div>
            {employees.length > 0 ? (
              <List
                height={Math.min(600, employees.length * ITEM_HEIGHT)}
                itemCount={employees.length}
                itemSize={ITEM_HEIGHT}
                itemData={itemData}
                overscanCount={5}
              >
                {EmployeeRow}
              </List>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Keine Mitarbeiter gefunden, die den Filterkriterien entsprechen.
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <div className="font-medium">Zugewiesene Schichten</div>
            <div className="text-xl font-bold text-blue-600">
              {assignments.length.toLocaleString()}
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <div className="font-medium">Verfügbare Mitarbeiter</div>
            <div className="text-xl font-bold text-green-600">
              {employees.filter(e => e.availability).length.toLocaleString()}
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded">
            <div className="font-medium">Backup verfügbar</div>
            <div className="text-xl font-bold text-orange-600">
              {assignments.reduce((acc, curr) => acc + curr.backupIds.length, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded">
            <div className="font-medium">Auslastung</div>
            <div className="text-xl font-bold text-purple-600">
              {employees.length > 0 ? Math.round((assignments.length / (employees.length * 7)) * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}