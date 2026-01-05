
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/timeTrackingService';

interface HealthStatus {
  database: 'healthy' | 'error' | 'checking';
  timeEntries: 'healthy' | 'error' | 'checking';
  rls: 'healthy' | 'error' | 'checking';
  auth: 'healthy' | 'error' | 'checking';
  activeTracking: 'healthy' | 'error' | 'checking';
}

export const TimeTrackingHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>({
    database: 'checking',
    timeEntries: 'checking',
    rls: 'checking',
    auth: 'checking',
    activeTracking: 'checking'
  });

  const [details, setDetails] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsRefreshing(true);
    
    // Check database connection
    try {
      const { data, error } = await supabase.from('time_entries').select('count').limit(1);
      if (error) throw error;
      setStatus(prev => ({ ...prev, database: 'healthy' }));
      setDetails(prev => ({ ...prev, database: 'Verbindung erfolgreich' }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, database: 'error' }));
      setDetails(prev => ({ ...prev, database: error.message }));
    }

    // Check auth
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStatus(prev => ({ ...prev, auth: 'healthy' }));
        setDetails(prev => ({ ...prev, auth: `Angemeldet als ${user.email}` }));
      } else {
        setStatus(prev => ({ ...prev, auth: 'error' }));
        setDetails(prev => ({ ...prev, auth: 'Nicht angemeldet' }));
      }
    } catch (error: any) {
      setStatus(prev => ({ ...prev, auth: 'error' }));
      setDetails(prev => ({ ...prev, auth: error.message }));
    }

    // Check time entries service
    try {
      await timeTrackingService.getTimeEntries();
      setStatus(prev => ({ ...prev, timeEntries: 'healthy' }));
      setDetails(prev => ({ ...prev, timeEntries: 'Service funktioniert' }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, timeEntries: 'error' }));
      setDetails(prev => ({ ...prev, timeEntries: error.message }));
    }

    // Check active tracking
    try {
      const activeEntry = await timeTrackingService.getActiveTimeEntry();
      setStatus(prev => ({ ...prev, activeTracking: 'healthy' }));
      setDetails(prev => ({ 
        ...prev, 
        activeTracking: activeEntry ? 'Aktive Zeiterfassung gefunden' : 'Keine aktive Zeiterfassung' 
      }));
    } catch (error: any) {
      setStatus(prev => ({ ...prev, activeTracking: 'error' }));
      setDetails(prev => ({ ...prev, activeTracking: error.message }));
    }

    // Check RLS
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('time_entries')
          .select('id')
          .limit(1);
        
        if (error && error.code === 'PGRST301') {
          setStatus(prev => ({ ...prev, rls: 'healthy' }));
          setDetails(prev => ({ ...prev, rls: 'RLS Policies aktiv' }));
        } else if (!error) {
          setStatus(prev => ({ ...prev, rls: 'healthy' }));
          setDetails(prev => ({ ...prev, rls: 'RLS funktioniert korrekt' }));
        } else {
          throw error;
        }
      } else {
        setStatus(prev => ({ ...prev, rls: 'error' }));
        setDetails(prev => ({ ...prev, rls: 'Authentifizierung erforderlich' }));
      }
    } catch (error: any) {
      setStatus(prev => ({ ...prev, rls: 'error' }));
      setDetails(prev => ({ ...prev, rls: error.message }));
    }

    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fehler</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Prüfung</Badge>;
    }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(status);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('checking')) return 'checking';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          System Health Check
          <Badge 
            className={
              overallStatus === 'healthy' ? 'bg-green-100 text-green-800 border-green-200' :
              overallStatus === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }
          >
            {overallStatus === 'healthy' ? 'Alles OK' : 
             overallStatus === 'error' ? 'Fehler erkannt' : 'Prüfung läuft...'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isRefreshing}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(status).map(([key, statusValue]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(statusValue)}
                  <span className="text-sm font-medium capitalize">
                    {key === 'database' ? 'Datenbank' :
                     key === 'timeEntries' ? 'Zeiteinträge' :
                     key === 'rls' ? 'Sicherheit (RLS)' :
                     key === 'auth' ? 'Authentifizierung' :
                     key === 'activeTracking' ? 'Aktive Erfassung' : key}
                  </span>
                  {getStatusBadge(statusValue)}
                </div>
                {details[key] && (
                  <p className="text-xs text-gray-600 mt-1">
                    {details[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {overallStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Probleme erkannt:</strong> Es gibt Probleme mit einem oder mehreren Systemkomponenten. 
                Überprüfen Sie die Details oben und wenden Sie sich bei anhaltenden Problemen an den Support.
              </p>
            </div>
          )}
          
          {overallStatus === 'healthy' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>System funktioniert einwandfrei:</strong> Alle Komponenten sind verfügbar und funktionieren korrekt.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
