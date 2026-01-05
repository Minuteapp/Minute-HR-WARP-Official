import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UsersRound, Wallet, TrendingUp } from 'lucide-react';
import { TeamRow } from './TeamRow';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CostCenterDetailsProps {
  costCenter: {
    id: string;
    total_personnel_cost?: number;
    employee_count?: number;
    team_count?: number;
    average_salary?: number;
  };
}

export const CostCenterDetails: React.FC<CostCenterDetailsProps> = ({ costCenter }) => {
  const { data: teams } = useQuery({
    queryKey: ['cost-center-teams', costCenter.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, employee_count, total_cost')
        .eq('cost_center_id', costCenter.id);
      if (error) throw error;
      return data || [];
    }
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€ ${(value / 1000).toFixed(0)}k`;
    return `€ ${value.toFixed(0)}`;
  };

  const stats = [
    {
      label: 'Gesamt-Personalkosten',
      value: formatCurrency(costCenter.total_personnel_cost || 0),
      icon: Wallet,
      color: 'text-primary'
    },
    {
      label: 'Mitarbeiter',
      value: costCenter.employee_count || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Teams',
      value: costCenter.team_count || 0,
      icon: UsersRound,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Ø Gehalt',
      value: formatCurrency(costCenter.average_salary || 0),
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="p-4 bg-muted/30 border-t border-border">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-background">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teams List */}
      <Card className="bg-background">
        <CardContent className="p-0">
          {teams && teams.length > 0 ? (
            teams.map(team => (
              <TeamRow key={team.id} team={team} />
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              Keine Teams gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
