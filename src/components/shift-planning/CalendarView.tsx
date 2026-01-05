import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Users2, ChevronLeft, ChevronRight, Plus, User, CalendarIcon, UserIcon, ClockIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDragDropShifts } from '../../hooks/useDragDropShifts';

export const CalendarView = () => {
  const { 
    shiftTypes, 
    employees, 
    assignments, 
    assignShift, 
    removeAssignment, 
    getAssignmentForCell 
  } = useDragDropShifts();
  
  const [selectedWeek, setSelectedWeek] = useState('18. November 2025');

  const weekDays = [
    { day: 'Mo', date: '18.08' },
    { day: 'Di', date: '19.08' },
    { day: 'Mi', date: '20.08' },
    { day: 'Do', date: '21.08' },
    { day: 'Fr', date: '22.08' },
    { day: 'Sa', date: '23.08' },
    { day: 'So', date: '24.08' }
  ];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Wenn von Schichttypen in Mitarbeiter-Zelle gezogen
    if (source.droppableId === 'shift-types' && destination.droppableId.includes('-')) {
      const [employeeId, day] = destination.droppableId.split('-');
      const shiftType = shiftTypes.find(s => s.id === draggableId);
      
      if (shiftType) {
        const success = assignShift(employeeId, day, shiftType);
        if (!success) {
          console.log('Mitarbeiter hat nicht die erforderlichen Qualifikationen');
        }
      }
    }
    
    // Wenn eine existierende Zuweisung verschoben wird
    if (source.droppableId.includes('-') && destination.droppableId.includes('-')) {
      const [sourceEmpId, sourceDay] = source.droppableId.split('-');
      const [destEmpId, destDay] = destination.droppableId.split('-');
      
      const assignment = getAssignmentForCell(sourceEmpId, sourceDay);
      if (assignment) {
        removeAssignment(assignment.id);
        assignShift(destEmpId, destDay, assignment.shiftType);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white">
      {/* Header with Date Navigation and Statistics */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Schichtplanung</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ChevronLeft className="w-4 h-4 cursor-pointer" />
              <span>18. November 2025</span>
              <ChevronRight className="w-4 h-4 cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2">
              Automatische Zuweisung
            </Button>
            <Button variant="outline" className="text-sm">Alle</Button>
            <div className="text-sm text-gray-500">Mitarbeiter suchen...</div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Zugewiesene Schichten</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Verfügbare Mitarbeiter</div>
              <div className="text-2xl font-bold text-gray-900">7</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Schichttypen</div>
              <div className="text-2xl font-bold text-gray-900">8</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Backup verfügbar</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Types Section */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox id="showAvailableShifts" />
          <label htmlFor="showAvailableShifts" className="text-sm font-medium text-gray-700">
            Verfügbare Schichttypen ziehen
          </label>
        </div>
        
        <Droppable droppableId="shift-types" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-4 gap-3"
            >
              {shiftTypes.map((shift, index) => (
                <Draggable key={shift.id} draggableId={shift.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-3 border rounded-lg cursor-move transition-all ${shift.color} ${
                        snapshot.isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm text-gray-900">{shift.name}</h3>
                        <span className="text-xs text-gray-600">{shift.workers} Mitarbeiter</span>
                      </div>
                      <div className="text-xs text-gray-700 mb-2">{shift.time}</div>
                      <div className="space-y-1">
                        {shift.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="text-xs text-gray-600">• {skill}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Weekly Schedule */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Wochenplan (8 Mitarbeiter)</h3>
            <p className="text-xs text-gray-600">Ziehen Sie Schichttypen in die Zellen oder verwenden Sie Drag-and-Drop</p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
              <div className="p-3 border-r border-gray-200">
                <div className="text-xs font-medium text-gray-700">Mitarbeiter</div>
              </div>
              {weekDays.map((day, index) => (
                <div key={day.day} className={`p-3 text-center ${index < weekDays.length - 1 ? 'border-r border-gray-200' : ''}`}>
                  <div className="text-xs font-medium text-gray-700">{day.day}</div>
                  <div className="text-xs text-gray-500">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Employee Rows */}
            {employees.map((employee, empIndex) => (
              <div key={employee.id} className={`grid grid-cols-8 ${empIndex < employees.length - 1 ? 'border-b border-gray-200' : ''}`}>
                {/* Employee Info */}
                <div className="p-3 border-r border-gray-200 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded text-xs flex items-center justify-center font-medium text-blue-700">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.department}</div>
                      <div className="text-xs text-gray-600 truncate">{employee.skills.join(', ')}</div>
                    </div>
                  </div>
                </div>

                {/* Day Cells */}
                {weekDays.map((day, dayIndex) => {
                  const assignment = getAssignmentForCell(employee.id, day.day);
                  return (
                    <Droppable key={`${employee.id}-${day.day}`} droppableId={`${employee.id}-${day.day}`}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`p-2 min-h-[80px] flex items-center justify-center relative ${
                            dayIndex < weekDays.length - 1 ? 'border-r border-gray-200' : ''
                          } ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'}`}
                        >
                          {assignment ? (
                            <Draggable 
                              draggableId={assignment.id} 
                              index={0}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                   className={`w-full p-2 rounded border cursor-move ${assignment.shiftType.color} ${
                                     snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                                   }`}
                                >
                                  <div className="text-xs font-medium text-gray-900">
                                    {assignment.shiftType.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {assignment.shiftType.time}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ) : (
                            <div className="text-xs text-gray-400 text-center w-full">
                              Schicht zuweisen
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};