import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useState } from "react";

interface TeamTasksFilters {
  department?: string;
  team?: string;
  location?: string;
  search?: string;
}

export const useTeamTasksData = (filters?: TeamTasksFilters) => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  // Lade alle Mitarbeiter mit ihren zugewiesenen Tasks - gefiltert nach company_id
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["team-tasks-data", companyId, filters],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("id, first_name, last_name, position, department, location, team, avatar_url, company_id")
        .eq("status", "active")
        .order("first_name", { ascending: true });
      
      // Filter nach company_id wenn vorhanden
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      // Filter nach Abteilung
      if (filters?.department) {
        query = query.eq("department", filters.department);
      }
      
      // Filter nach Team
      if (filters?.team) {
        query = query.eq("team", filters.team);
      }
      
      // Filter nach Standort
      if (filters?.location) {
        query = query.eq("location", filters.location);
      }
      
      // Suche nach Name
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
      }
      
      const { data: employees, error: empError } = await query;
      
      if (empError) throw empError;

      // Für jeden Mitarbeiter Tasks zählen
      const membersWithTasks = await Promise.all(
        (employees || []).map(async (emp) => {
          const { data: tasks, error: taskError } = await supabase
            .from("project_tasks")
            .select("id, status, priority, due_date")
            .eq("assigned_to", emp.id);
          
          if (taskError) throw taskError;

          const activeTasks = (tasks || []).filter(t => t.status !== 'done' && t.status !== 'archived');
          const completedTasks = (tasks || []).filter(t => t.status === 'done');
          const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
          
          // Berechne Workload Prozent (basierend auf aktiven Tasks)
          const workloadPercent = Math.min(100, activeTasks.length * 10);

          return {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            avatar: emp.avatar_url || undefined,
            role: emp.position || "Mitarbeiter",
            department: emp.department || "Unbekannt",
            location: emp.location || "Unbekannt",
            team: emp.team || "Unbekannt",
            activeTasks: activeTasks.length,
            completedTasks: completedTasks.length,
            urgentTasks: urgentTasks.length,
            workloadPercent,
          };
        })
      );

      return membersWithTasks;
    },
  });

  // Lade alle Tasks für Statistiken - gefiltert nach company_id
  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ["all-tasks", companyId],
    queryFn: async () => {
      let query = supabase
        .from("project_tasks")
        .select("*");
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  // Lade Filter-Optionen (Abteilungen, Teams, Standorte)
  const { data: filterOptions = { departments: [], teams: [], locations: [] } } = useQuery({
    queryKey: ["team-filter-options", companyId],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("department, team, location")
        .eq("status", "active");
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const departments = [...new Set((data || []).map(e => e.department).filter(Boolean))];
      const teams = [...new Set((data || []).map(e => e.team).filter(Boolean))];
      const locations = [...new Set((data || []).map(e => e.location).filter(Boolean))];
      
      return { departments, teams, locations };
    },
  });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const statistics = {
    totalTeamTasks: allTasks.length,
    averageWorkload: teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.workloadPercent, 0) / teamMembers.length)
      : 0,
    overloadedMembers: teamMembers.filter(m => m.workloadPercent > 100).length,
    completedThisWeek: allTasks.filter(t => {
      if (!t.updated_at || t.status !== 'done') return false;
      const completedDate = new Date(t.updated_at);
      return completedDate >= startOfWeek;
    }).length,
  };

  return {
    teamMembers,
    statistics,
    filterOptions,
    isLoading: isLoadingMembers || isLoadingTasks,
  };
};
