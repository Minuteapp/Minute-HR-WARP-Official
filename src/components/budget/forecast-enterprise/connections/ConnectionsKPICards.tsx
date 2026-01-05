import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link, DollarSign, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ConnectionsKPICards: React.FC = () => {
  const { data: connections } = useQuery({
    queryKey: ['budget-module-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_module_connections')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const activeCount = connections?.filter(c => c.status === 'active').length || 0;
  const pendingCount = connections?.filter(c => c.status === 'pending').length || 0;
  const totalLinkedAmount = connections?.reduce((sum, c) => sum + (Number(c.linked_amount) || 0), 0) || 0;
  const lastSync = connections?.reduce((latest, c) => {
    if (!c.last_sync_at) return latest;
    const syncDate = new Date(c.last_sync_at);
    return syncDate > latest ? syncDate : latest;
  }, new Date(0));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€ ${(value / 1000000).toFixed(2)} Mio`;
    }
    return `€ ${value.toLocaleString('de-DE')}`;
  };

  const kpis = [
    {
      title: 'Aktive Module',
      value: `${connections?.length || 0} Module`,
      subtitle: `${activeCount} aktiv, ${pendingCount} ausstehend`,
      icon: Link,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Verknüpftes Volumen',
      value: formatCurrency(totalLinkedAmount),
      subtitle: 'des Gesamtbudgets',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Auto-Updates',
      value: 'Echtzeit',
      subtitle: lastSync && lastSync.getTime() > 0 
        ? `Letzte Aktualisierung: ${lastSync.toLocaleDateString('de-DE')}`
        : 'Keine Aktualisierungen',
      icon: CheckCircle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
