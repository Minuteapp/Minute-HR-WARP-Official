import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const AuditLogsList = () => {
  const { tenantCompany } = useTenant();

  const { data: logs = [] } = useQuery({
    queryKey: ['recruiting-audit-logs', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .or('table_name.eq.candidates,table_name.eq.job_applications,table_name.eq.job_offers')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const getActionLabel = (action: string, tableName: string) => {
    const actions: Record<string, string> = {
      'INSERT': 'Erstellt',
      'UPDATE': 'Aktualisiert',
      'DELETE': 'Gelöscht'
    };
    const tables: Record<string, string> = {
      'candidates': 'Kandidat',
      'job_applications': 'Bewerbung',
      'job_offers': 'Angebot'
    };
    return `${tables[tableName] || tableName} ${actions[action] || action}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktuelle Audit-Logs (Letzte 20)</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Audit-Logs vorhanden.
          </p>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  {format(new Date(log.created_at), 'dd.MM.yyyy, HH:mm', { locale: de })}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">{log.user_email || 'System'}</span>
                <span>-</span>
                <span>{getActionLabel(log.action, log.table_name)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditLogsList;
