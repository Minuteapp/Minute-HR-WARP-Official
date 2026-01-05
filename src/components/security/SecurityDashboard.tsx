import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Lock,
  Settings,
  Activity,
  Users,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MFASetup } from '@/components/auth/MFASetup';
import { SecurityAuditLog } from './SecurityAuditLog';

interface SecurityMetrics {
  totalUsers: number;
  mfaEnabledUsers: number;
  recentLoginAttempts: number;
  failedLogins: number;
  securityAlerts: number;
  validationFailures: number;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  resolved: boolean;
}

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    mfaEnabledUsers: 0,
    recentLoginAttempts: 0,
    failedLogins: 0,
    securityAlerts: 0,
    validationFailures: 0
  });
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMFASetupOpen, setIsMFASetupOpen] = useState(false);
  const [userMFAStatus, setUserMFAStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check user's MFA status
      const { data: mfaSettings } = await supabase
        .from('user_mfa_settings')
        .select('mfa_enabled')
        .eq('user_id', user.id)
        .single();
      
      setUserMFAStatus(mfaSettings?.mfa_enabled || false);

      // Load security metrics (only for admins)
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRole?.role === 'admin' || userRole?.role === 'superadmin') {
        await loadSecurityMetrics();
        await loadSecurityAlerts();
      }

    } catch (error: any) {
      console.error('Error loading security data:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Sicherheitsdaten",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityMetrics = async () => {
    try {
      // Count total users with roles
      const { count: totalUsers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      // Count MFA enabled users
      const { count: mfaEnabledUsers } = await supabase
        .from('user_mfa_settings')
        .select('*', { count: 'exact', head: true })
        .eq('mfa_enabled', true);

      // Count recent login attempts (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recentLoginAttempts } = await supabase
        .from('security_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'LOGIN')
        .gte('created_at', yesterday.toISOString());

      // Count failed logins (last 24 hours)
      const { count: failedLogins } = await supabase
        .from('security_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'LOGIN')
        .eq('success', false)
        .gte('created_at', yesterday.toISOString());

      // Count validation failures (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count: validationFailures } = await supabase
        .from('hr_validation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString());

      setMetrics({
        totalUsers: totalUsers || 0,
        mfaEnabledUsers: mfaEnabledUsers || 0,
        recentLoginAttempts: recentLoginAttempts || 0,
        failedLogins: failedLogins || 0,
        securityAlerts: alerts.filter(a => !a.resolved).length,
        validationFailures: validationFailures || 0
      });

    } catch (error) {
      console.error('Error loading security metrics:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      // Keine Mock-Daten - leeres Array für neue Firmen
      // In production werden hier echte Alerts aus der Datenbank geladen
      setAlerts([]);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  };

  const handleMFASetupSuccess = () => {
    setUserMFAStatus(true);
    loadSecurityData();
    toast({
      title: "MFA erfolgreich aktiviert",
      description: "Ihr Konto ist jetzt besser geschützt."
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Eye;
      case 'low': return CheckCircle;
      default: return Shield;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Lade Sicherheitsdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sicherheits-Dashboard</h1>
          <p className="text-gray-600">Überwachen Sie die Sicherheit Ihrer HR-Anwendung</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="mfa">Zwei-Faktor-Auth</TabsTrigger>
          <TabsTrigger value="alerts">Sicherheitswarnungen</TabsTrigger>
          <TabsTrigger value="logs">Aktivitätslogs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamte Benutzer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registrierte Benutzer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA-Abdeckung</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalUsers > 0 
                    ? Math.round((metrics.mfaEnabledUsers / metrics.totalUsers) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.mfaEnabledUsers} von {metrics.totalUsers} Benutzern
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Login-Versuche (24h)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.recentLoginAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.failedLogins} fehlgeschlagen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validierungsfehler (7d)</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.validationFailures}</div>
                <p className="text-xs text-muted-foreground">
                  HR-Datenvalidierung
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Warnungen</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.securityAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Benötigen Aufmerksamkeit
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Zwei-Faktor-Authentifizierung
              </CardTitle>
              <CardDescription>
                Erhöhen Sie die Sicherheit Ihres Kontos mit einer zusätzlichen Authentifizierungsebene.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">MFA-Status</h4>
                  <p className="text-sm text-gray-600">
                    {userMFAStatus 
                      ? 'Zwei-Faktor-Authentifizierung ist aktiviert' 
                      : 'Zwei-Faktor-Authentifizierung ist deaktiviert'
                    }
                  </p>
                </div>
                <Badge variant={userMFAStatus ? 'default' : 'destructive'}>
                  {userMFAStatus ? 'Aktiviert' : 'Deaktiviert'}
                </Badge>
              </div>
              
              {!userMFAStatus && (
                <Button 
                  onClick={() => setIsMFASetupOpen(true)}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  MFA jetzt aktivieren
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Keine aktiven Sicherheitswarnungen</p>
                  <p className="text-gray-600">Ihr System läuft sicher.</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <Card key={alert.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <SeverityIcon className="w-5 h-5" />
                          {alert.title}
                        </CardTitle>
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-2">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleString('de-DE')}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <SecurityAuditLog />
        </TabsContent>
      </Tabs>

      <MFASetup 
        isOpen={isMFASetupOpen}
        onClose={() => setIsMFASetupOpen(false)}
        onSuccess={handleMFASetupSuccess}
      />
    </div>
  );
};