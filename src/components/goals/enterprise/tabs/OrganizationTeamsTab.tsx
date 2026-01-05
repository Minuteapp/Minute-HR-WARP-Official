import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { OrganizationHeader } from "../organization/OrganizationHeader";
import { OrganizationHierarchy } from "../organization/OrganizationHierarchy";
import { OrganizationSummaryFooter } from "../organization/OrganizationSummaryFooter";

export const OrganizationTeamsTab = () => {
  const [viewMode, setViewMode] = useState<'structure' | 'goals'>('structure');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('id');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <OrganizationHeader 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
        
        <OrganizationHierarchy showGoals={viewMode === 'goals'} />
        
        <OrganizationSummaryFooter
          departmentCount={departments.length}
          teamCount={teams.length}
          employeeCount={employees.length}
          goalCount={goals.length}
        />
      </CardContent>
    </Card>
  );
};
