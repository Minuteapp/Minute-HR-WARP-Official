import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, Key, Smartphone, Monitor, AlertTriangle,
  Clock, LogOut, CheckCircle, XCircle, MapPin
} from 'lucide-react';

export const SecurityAccessTab: React.FC = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const { toast } = useToast();

  const { data: mfaData, isLoading: loadingMfa } = useQuery({
    queryKey: ['mfa-settings', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ['user-sessions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const { data: auditLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs-security', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) {
        console.log('audit_logs query error:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!companyId
  });

  const mfaUsers = (mfaData || []).map(m => ({
    user_id: m.user_id,
    user_name: `Benutzer ${m.user_id.slice(0, 8)}`,
    mfa_enabled: m.is_enabled,
    mfa_method: m.mfa_type,
    last_verified: m.last_verified_at
  }));

  const activeSessions = (sessionsData || []).map(s => ({
    id: s.id,
    user_id: s.user_id,
    user_name: `Benutzer ${s.user_id.slice(0, 8)}`,
    ip_address: s.ip_address || 'Unbekannt',
    user_agent: s.user_agent || 'Unbekannt',
    location: 'Deutschland',
    last_activity: s.last_activity,
    is_current: false
  }));

  const loginEvents = auditLogs.map((log: any) => ({
    id: log.id,
    user_id: log.user_id || '',
    user_name: log.user_name || `Benutzer ${(log.user_id || '').slice(0, 8)}`,
    event_type: log.action?.includes('login') ? 'login_success' : 
                log.action?.includes('failed') ? 'login_failed' : 
                log.action?.includes('logout') ? 'logout' : 'mfa_challenge',
    ip_address: log.ip_address || 'Unbekannt',
    timestamp: log.created_at,
    details: log.details || log.action || ''
  }));

  const enabled = mfaUsers.filter(m => m.mfa_enabled).length;
  const total = mfaUsers.length;
  const mfaStats = { enabled, disabled: total - enabled, total };

  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session beendet",
        description: "Die Sitzung wurde erfolgreich beendet."
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'login_failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'mfa_challenge': return <Smartphone className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const mfaPercentage = mfaStats.total > 0 ? (mfaStats.enabled / mfaStats.total) * 100 : 0;
  const isLoading = loadingMfa || loadingSessions || loadingLogs;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MFA-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MFA aktiviert</p>
                <p className="text-2xl font-bold text-green-600">{mfaStats.enabled}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MFA deaktiviert</p>
                <p className="text-2xl font-bold text-amber-600">{mfaStats.disabled}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">MFA-Abdeckung</span>
                <span className="font-medium">{Math.round(mfaPercentage)}%</span>
              </div>
              <Progress value={mfaPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA-Status pro Benutzer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Zwei-Faktor-Authentifizierung
          </CardTitle>
          <CardDescription>
            MFA-Status aller Benutzer im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Keine MFA-Einstellungen vorhanden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>MFA-Status</TableHead>
                  <TableHead>Methode</TableHead>
                  <TableHead>Letzte Verifizierung</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mfaUsers.slice(0, 5).map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.user_name}</TableCell>
                    <TableCell>
                      <Badge className={user.mfa_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.mfa_enabled ? 'Aktiviert' : 'Deaktiviert'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.mfa_method || '-'}</TableCell>
                    <TableCell>
                      {user.last_verified 
                        ? new Date(user.last_verified).toLocaleDateString('de-DE')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        {user.mfa_enabled ? 'Zurücksetzen' : 'Erzwingen'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Aktive Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Aktive Sitzungen
          </CardTitle>
          <CardDescription>
            Alle aktuell aktiven Benutzer-Sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Keine aktiven Sitzungen</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Gerät</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead>Letzte Aktivität</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.user_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {session.user_agent.toLowerCase().includes('mobile') 
                          ? <Smartphone className="h-4 w-4" />
                          : <Monitor className="h-4 w-4" />
                        }
                        <span className="text-sm truncate max-w-[150px]">
                          {session.user_agent.split(' ')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {session.ip_address}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(session.last_activity).toLocaleString('de-DE')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => terminateSession(session.id)}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Login-Historie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login-Ereignisse
          </CardTitle>
          <CardDescription>
            Letzte Anmelde-Ereignisse im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginEvents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Keine Login-Ereignisse vorhanden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginEvents.map(event => (
                  <TableRow key={event.id}>
                    <TableCell>{getEventIcon(event.event_type)}</TableCell>
                    <TableCell className="font-medium">{event.user_name}</TableCell>
                    <TableCell>{event.ip_address}</TableCell>
                    <TableCell>{new Date(event.timestamp).toLocaleString('de-DE')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{event.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
