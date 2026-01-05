import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTasksOverview = () => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Berechne Statistiken
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const statistics = {
    totalOpen: tasks.filter(t => t.status !== 'done' && t.status !== 'archived' && t.status !== 'deleted').length,
    dueToday: tasks.filter(t => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && t.status !== 'done';
    }).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    dueThisWeek: tasks.filter(t => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= today && dueDate <= endOfWeek && t.status !== 'done';
    }).length,
    completedThisWeek: tasks.filter(t => {
      if (!t.updated_at || t.status !== 'done') return false;
      const completedDate = new Date(t.updated_at);
      return completedDate >= startOfWeek && completedDate <= endOfWeek;
    }).length,
  };

  // Filtere auf die neuesten 5 Tasks für die Übersicht
  const recentTasks = tasks.slice(0, 5);

  return {
    tasks: recentTasks,
    allTasks: tasks,
    statistics,
    isLoading,
  };
};
