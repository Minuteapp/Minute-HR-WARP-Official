// Settings-Driven Architecture (SDA) - Audit Log Komponente
// Zeigt die Änderungshistorie der Einstellungen

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, ArrowRight, User, Clock, Globe, Building2, MapPin, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { SettingScopeLevel } from '@/types/settings-driven';

interface AuditLogEntry {
  id: string;
  module: string;
  key: string;
  action: string;
  old_value: any;
  new_value: any;
  scope_level: SettingScopeLevel;
  scope_entity_name: string | null;
  changed_by_name: string | null;
  changed_at: string;
  reason: string | null;
}

const SCOPE_ICONS: Record<SettingScopeLevel, React.ElementType> = {
  global: Globe,
  company: Building2,
  location: MapPin,
  department: Users,
  team: Users,
  role: Shield,
  user: User
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  INSERT: { label: 'Erstellt', color: 'bg-green-100 text-green-700' },
  UPDATE: { label: 'Geändert', color: 'bg-blue-100 text-blue-700' },
  DELETE: { label: 'Gelöscht', color: 'bg-red-100 text-red-700' }
};

interface SettingsAuditLogProps {
  module?: string;
  limit?: number;
}

export const SettingsAuditLog: React.FC<SettingsAuditLogProps> = ({
  module,
  limit = 50
}) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['settingsAuditLog', module, limit],
    queryFn: async () => {
      let query = supabase
        .from('settings_audit_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SDA] Fehler beim Laden des Audit-Logs:', error);
        return [];
      }

      return data as AuditLogEntry[];
    }
  });

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Ja' : 'Nein';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Änderungshistorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Lade Änderungshistorie...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Änderungshistorie
          {auditLogs && auditLogs.length > 0 && (
            <Badge variant="secondary">{auditLogs.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!auditLogs || auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Änderungen gefunden
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const ScopeIcon = SCOPE_ICONS[log.scope_level] || Globe;
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };

                return (
                  <div
                    key={log.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <ScopeIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{log.key}</span>
                        <Badge className={actionInfo.color}>{actionInfo.label}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.module}
                        </Badge>
                      </div>
                      
                      {log.action === 'UPDATE' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">
                            {formatValue(log.old_value)}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                            {formatValue(log.new_value)}
                          </span>
                        </div>
                      )}

                      {log.action === 'INSERT' && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Neuer Wert: <span className="font-medium">{formatValue(log.new_value)}</span>
                        </div>
                      )}

                      {log.reason && (
                        <p className="text-sm text-muted-foreground mb-2 italic">
                          "{log.reason}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.changed_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </span>
                        {log.changed_by_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.changed_by_name}
                          </span>
                        )}
                        {log.scope_entity_name && (
                          <span className="flex items-center gap-1">
                            <ScopeIcon className="h-3 w-3" />
                            {log.scope_entity_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsAuditLog;
