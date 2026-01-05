import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Clock, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ArchiveKPICards: React.FC = () => {
  const { data: archivedBudgets } = useQuery({
    queryKey: ['archived-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('archived_budgets')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reports } = useQuery({
    queryKey: ['budget-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_reports')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['budget-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_audit_logs')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const years = archivedBudgets?.map(b => b.fiscal_year) || [];
  const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

  const kpis = [
    {
      title: 'Archivierte Budgets',
      value: `${archivedBudgets?.length || 0} Jahre`,
      subtitle: years.length > 0 ? `${minYear} - ${maxYear}` : 'Keine Daten',
      icon: Calendar
    },
    {
      title: 'Berichte',
      value: `${reports?.length || 0} Dokumente`,
      subtitle: 'Alle Geschäftsjahre',
      icon: FileText
    },
    {
      title: 'Änderungsprotokolle',
      value: `${auditLogs?.length || 0} Einträge`,
      subtitle: 'Vollständige Audit-Historie',
      icon: Clock
    },
    {
      title: 'Datenspeicher',
      value: '2,4 GB',
      subtitle: 'Archivgröße gesamt',
      icon: Download
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold mt-1 text-primary">{kpi.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{kpi.subtitle}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
