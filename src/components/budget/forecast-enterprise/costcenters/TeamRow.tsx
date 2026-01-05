import React, { useState } from 'react';
import { ChevronRight, Users } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EmployeeRow } from './EmployeeRow';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamRowProps {
  team: {
    id: string;
    name: string;
    employee_count?: number;
    total_cost?: number;
  };
}

export const TeamRow: React.FC<TeamRowProps> = ({ team }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: employees } = useQuery({
    queryKey: ['team-employees', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position, salary, hire_date, status')
        .eq('team_id', team.id);
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors border-b border-border">
          <div className="flex items-center gap-3">
            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium">{team.name}</p>
              <p className="text-sm text-muted-foreground">{team.employee_count || 0} Mitarbeiter</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(team.total_cost || 0)}</p>
            <p className="text-xs text-muted-foreground">Personalkosten</p>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-12 bg-muted/20">
          {employees && employees.length > 0 ? (
            employees.map(employee => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Keine Mitarbeiter gefunden
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
