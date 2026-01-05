import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface AuditTrailSectionProps {
  employeeId: string;
}

interface AuditLogEntry {
  id: string;
  changed_by_name: string;
  change_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  change_description: string | null;
  created_at: string;
}

export const AuditTrailSection = ({ employeeId }: AuditTrailSectionProps) => {
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['employee-audit-log', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_audit_log')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditLogEntry[];
    },
  });

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Erstellt</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Geändert</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Gelöscht</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getFieldLabel = (fieldName: string | null): string => {
    const labels: Record<string, string> = {
      'first_name': 'Vorname',
      'last_name': 'Nachname',
      'email': 'E-Mail',
      'gender': 'Geschlecht',
      'iban': 'IBAN',
      'bic': 'BIC',
      'tax_class': 'Steuerklasse',
      'salary_amount': 'Gehalt',
      'manager_id': 'Vorgesetzter',
      'phone': 'Telefon',
      'mobile_phone': 'Mobiltelefon',
      'street': 'Straße',
      'city': 'Stadt',
      'postal_code': 'PLZ',
      'position': 'Position',
      'department': 'Abteilung',
      'team': 'Team',
    };
    return fieldName ? labels[fieldName] || fieldName : '';
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Änderungsverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Änderungsverlauf
        </CardTitle>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Noch keine Änderungen protokolliert</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getChangeTypeBadge(log.change_type)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {log.change_description || `${getFieldLabel(log.field_name)} geändert`}
                    </p>
                    {log.field_name && log.old_value && log.new_value && log.old_value !== '***masked***' && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200">
                          {log.old_value}
                        </span>
                        <span>→</span>
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                          {log.new_value}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      von {log.changed_by_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
