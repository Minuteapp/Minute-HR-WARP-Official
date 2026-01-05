import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, Plus, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

const TasksWidget = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();
  
  // Lade alle Aufgaben mit explizitem company_id Filter
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['dashboard-tasks', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const handleCardClick = () => {
    navigate('/tasks');
  };

  if (isLoading) return <Card className="p-4 cursor-pointer" onClick={handleCardClick}>Lädt...</Card>;

  // Statistiken berechnen
  const todoTasks = tasks?.filter(t => t.status === 'todo') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in-progress') || [];
  const doneTasks = tasks?.filter(t => t.status === 'done') || [];
  const overdueTasks = tasks?.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== 'done';
  }) || [];

  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0;

  return (
    <Card className="p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-semibold">Aufgaben</h2>
          <p className="text-blue-600 text-sm font-medium">
            {totalTasks} Aufgaben gesamt
          </p>
        </div>
        <CheckCircle2 className="h-5 w-5 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#E8F5E8] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 mb-1" />
            <span className="text-xl font-bold">{doneTasks.length}</span>
            <span className="text-xs text-gray-600">Erledigt</span>
          </div>
        </div>
        
        <div className="bg-[#E3F2FD] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 text-blue-600 mb-1" />
            <span className="text-xl font-bold">{inProgressTasks.length}</span>
            <span className="text-xs text-gray-600">In Bearbeitung</span>
          </div>
        </div>
        
        <div className="bg-[#FFF3E0] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <Plus className="h-4 w-4 text-orange-600 mb-1" />
            <span className="text-xl font-bold">{todoTasks.length}</span>
            <span className="text-xs text-gray-600">Zu erledigen</span>
          </div>
        </div>
        
        <div className="bg-[#FFEBEE] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mb-1" />
            <span className="text-xl font-bold">{overdueTasks.length}</span>
            <span className="text-xs text-gray-600">Überfällig</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Fortschritt gesamt</span>
          <span>{completionRate.toFixed(0)}%</span>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      {/* Aktuelle Aufgaben anzeigen */}
      <div className="space-y-2">
        {tasks && tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="border-l-4 border-blue-500 pl-3 py-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium truncate">{task.title}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                task.status === 'done' ? 'bg-green-100 text-green-800' : 
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status === 'done' ? 'Erledigt' : 
                 task.status === 'in-progress' ? 'In Bearbeitung' : 
                 task.status === 'todo' ? 'Zu erledigen' : task.status}
              </span>
            </div>
            {task.due_date && (
              <div className="mt-1">
                <span className="text-xs text-gray-500">
                  Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                </span>
              </div>
            )}
          </div>
        ))}
        
        {(!tasks || tasks.length === 0) && (
          <div className="text-center text-sm text-gray-500 py-2">
            Keine Aufgaben gefunden
          </div>
        )}
      </div>
    </Card>
  );
};

export default TasksWidget;
