import { useState } from 'react';
import { UserPlus, ListTodo, Clock, Info } from 'lucide-react';
import AddEmployeeDialog from '../dialogs/AddEmployeeDialog';
import AddTaskDialog from '../dialogs/AddTaskDialog';
import TimeTrackingDialog from '../dialogs/TimeTrackingDialog';
import { useToast } from "@/components/ui/use-toast";
import { useTasksStore } from '@/stores/useTasksStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffectiveSettings } from '@/hooks/useEffectiveSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';

const QuickActionsWidget = () => {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [timeTrackingMode, setTimeTrackingMode] = useState<"start" | "end">("start");
  const { toast } = useToast();
  const { addTask } = useTasksStore();
  const queryClient = useQueryClient();

  // 80/20-Matrix: Modul-Sichtbarkeit prüfen
  const { isModuleVisible } = useSidebarPermissions();
  const canSeeEmployees = isModuleVisible('/employees');
  const canSeeTasks = isModuleVisible('/tasks');
  const canSeeTimeTracking = isModuleVisible('/time');

  // Settings-Driven Architecture: Lade Einstellungen für verschiedene Module
  const { isAllowed: isTimeTrackingAllowed, getRestrictionReason: getTimeTrackingReason } = useEffectiveSettings('timetracking');
  const { isAllowed: isTaskAllowed, getRestrictionReason: getTaskReason } = useEffectiveSettings('tasks');
  
  // Prüfe Berechtigungen (Modul-Sichtbarkeit UND Settings)
  const canStartTimeTracking = canSeeTimeTracking && isTimeTrackingAllowed('manual_booking_allowed');
  const canCreateTask = canSeeTasks && isTaskAllowed('create_task_allowed');

  const handleTaskSubmit = (taskData: any) => {
    // Bereits durch AddTaskDialog behandelt, daher nicht mehr notwendig
    toast({
      title: "Aufgabe erstellt",
      description: `Die Aufgabe "${taskData.title}" wurde erfolgreich erstellt.`,
    });
  };

  const handleTimeTrackingSuccess = () => {
    toast({
      title: "Zeiterfassung gestartet",
      description: "Ihre Arbeitszeit wird jetzt erfasst.",
    });
    
    // Invalidiere die Abfragen für die Zeiterfassung
    queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
    queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
    queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Schnelle Aktionen</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mitarbeiter hinzufügen - nur wenn Modul sichtbar */}
        {canSeeEmployees && (
          <button 
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors shadow-card"
          >
            <UserPlus size={20} />
            <span>Mitarbeiter hinzufügen</span>
          </button>
        )}
        
        {/* Aufgabe erstellen - bedingt durch Settings */}
        {canCreateTask ? (
          <button 
            onClick={() => setShowAddTask(true)}
            className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors shadow-card"
          >
            <ListTodo size={20} />
            <span>Aufgabe erstellen</span>
          </button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground cursor-not-allowed shadow-card">
                  <ListTodo size={20} />
                  <span>Aufgabe erstellen</span>
                  <Info size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{getTaskReason('create_task_allowed') || 'Nicht verfügbar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Einstempeln - bedingt durch Settings */}
        {canStartTimeTracking ? (
          <button 
            onClick={() => {
              setTimeTrackingMode("start");
              setShowTimeTracking(true);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors shadow-card"
          >
            <Clock size={20} />
            <span>Einstempeln</span>
          </button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg text-muted-foreground cursor-not-allowed shadow-card">
                  <Clock size={20} />
                  <span>Einstempeln</span>
                  <Info size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{getTimeTrackingReason('manual_booking_allowed') || 'Nicht verfügbar'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <AddEmployeeDialog 
        open={showAddEmployee} 
        onOpenChange={setShowAddEmployee}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['employees'] });
          toast({
            title: "Mitarbeiter erstellt",
            description: "Der neue Mitarbeiter wurde erfolgreich angelegt.",
          });
        }}
      />
      
      <AddTaskDialog 
        open={showAddTask} 
        onOpenChange={setShowAddTask}
        onSubmit={handleTaskSubmit}
      />
      
      <TimeTrackingDialog 
        open={showTimeTracking} 
        onOpenChange={setShowTimeTracking}
        mode={timeTrackingMode}
        onSuccess={handleTimeTrackingSuccess}
      />
    </div>
  );
};

export default QuickActionsWidget;
