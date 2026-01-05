import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Eye, 
  UserCog, 
  Clock, 
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SupportAccessEntry {
  id: string;
  started_at: string;
  ended_at: string | null;
  mode: 'view_only' | 'act_as';
  justification_type: string;
  reason: string;
  duration_minutes: number;
  is_pre_tenant: boolean;
}

interface SupportAccessLogProps {
  companyId: string;
}

export function SupportAccessLog({ companyId }: SupportAccessLogProps) {
  const [accessLogs, setAccessLogs] = useState<SupportAccessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [transparencyEnabled, setTransparencyEnabled] = useState(false);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    
    // Check if transparency is enabled
    const { data: companyData } = await supabase
      .from('companies')
      .select('support_access_transparency')
      .eq('id', companyId)
      .single();
    
    setTransparencyEnabled(companyData?.support_access_transparency || false);

    // Load support access logs
    const { data, error } = await supabase
      .from('customer_support_access_log')
      .select('*')
      .eq('target_tenant_id', companyId)
      .order('started_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setAccessLogs(data as SupportAccessEntry[]);
    }
    
    setLoading(false);
  };

  const getModeIcon = (mode: string) => {
    return mode === 'view_only' ? Eye : UserCog;
  };

  const getModeColor = (mode: string) => {
    return mode === 'view_only' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-amber-100 text-amber-800';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1 Min';
    if (minutes < 60) return `${Math.round(minutes)} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getJustificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ticket': 'Ticket',
      'test_case': 'Testfall',
      'support': 'Support',
      'debugging': 'Debugging',
      'other': 'Sonstiges'
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Support-Zugriffe
            </CardTitle>
            <CardDescription>
              Protokoll der Support-Zugriffe auf Ihr System
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!transparencyEnabled && (
          <div className="mb-4 p-3 bg-muted rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Support-Transparenz ist deaktiviert. Aktivieren Sie diese Option in den 
              Einstellungen, um detaillierte Begründungen für Support-Zugriffe zu sehen.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Laden...
          </div>
        ) : accessLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Support-Zugriffe protokolliert
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {accessLogs.map((log) => {
                const ModeIcon = getModeIcon(log.mode);
                return (
                  <div 
                    key={log.id} 
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <ModeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getModeColor(log.mode)}>
                              {log.mode === 'view_only' ? 'View-only' : 'Act-as'}
                            </Badge>
                            <Badge variant="outline">
                              {getJustificationTypeLabel(log.justification_type)}
                            </Badge>
                            {log.is_pre_tenant && (
                              <Badge variant="secondary">Pre-Tenant</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{log.reason}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.started_at), 'dd.MM.yyyy', { locale: de })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.started_at), 'HH:mm', { locale: de })}
                          {log.ended_at && ` - ${format(new Date(log.ended_at), 'HH:mm', { locale: de })}`}
                        </div>
                        <div className="font-medium">
                          {formatDuration(log.duration_minutes)}
                        </div>
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
}
