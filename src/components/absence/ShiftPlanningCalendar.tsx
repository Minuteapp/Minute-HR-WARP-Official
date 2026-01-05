
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useShiftManagement } from '@/hooks/useShiftManagement';
import { AutoPlanningDialog } from './AutoPlanningDialog';
import ShiftCard from './ShiftCard';
import type { PlanningPeriod } from '@/types/shifts';
import type { Employee } from '@/types/shift-planning';
import { useToast } from "@/components/ui/use-toast";


const ShiftPlanningCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<PlanningPeriod>('day');
  const [isAutoPlanDialogOpen, setIsAutoPlanDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  
  const { shifts, handleDragEnd, fetchShifts } = useShiftManagement(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handleSuccess = () => {
    fetchShifts();
    toast({
      title: "Schichten erfolgreich geplant",
      description: "Die automatische Planung wurde erfolgreich durchgeführt."
    });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: de })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsAutoPlanDialogOpen(true)}
          >
            Automatisch planen
          </Button>
          <Button 
            variant="default"
            onClick={() => toast({
              title: "Mitarbeiter-Liste",
              description: `${employees.length} Mitarbeiter verfügbar für die Planung`
            })}
          >
            Mitarbeiter anzeigen ({employees.length})
          </Button>
        </div>
        <AutoPlanningDialog
          isOpen={isAutoPlanDialogOpen}
          onOpenChange={setIsAutoPlanDialogOpen}
          selectedPeriod={selectedPeriod}
          onPeriodChange={(value) => setSelectedPeriod(value)}
          currentDate={currentDate}
          onSuccess={handleSuccess}
        />
      </div>

      <div className="bg-secondary/10 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">Verfügbare Mitarbeiter für Schichtplanung</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <p className="font-medium">{employee.name}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {employee.qualifications.map((qual, idx) => (
                  <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {qual}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-4">
          {daysInMonth.map((day) => (
            <Droppable droppableId={format(day, 'yyyy-MM-dd')} key={day.toISOString()}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[150px] p-4 rounded-lg border ${
                    snapshot.isDraggingOver 
                      ? 'bg-calendar-active border-primary/20' 
                      : 'bg-calendar-background border-border/40'
                  }`}
                >
                  <div className="font-medium mb-2 text-sm text-foreground/80">
                    {format(day, 'EEEE', { locale: de })}
                    <br />
                    {format(day, 'd.MM.', { locale: de })}
                  </div>
                  {shifts
                    .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
                    .map((shift, index) => {
                      return (
                        <Draggable
                          key={shift.id}
                          draggableId={shift.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <ShiftCard
                                shift={{
                                  ...shift,
                                  employeeId: shift.employee_id || undefined
                                }}
                                employees={employees}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ShiftPlanningCalendar;
