import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  ShieldOff, 
  Key, 
  Mail, 
  Monitor, 
  LogOut, 
  Smartphone, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  History,
  UserPlus,
  Link,
  Unlink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface UserAdminTabProps {
  employeeId: string;
}

interface AccountStatus {
  id: string;
  user_id: string;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_by: string | null;
  suspended_reason: string | null;
  last_password_reset: string | null;
  last_credentials_sent: string | null;
  two_factor_enabled: boolean;
  two_factor_reset_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
}

interface LoginHistoryEntry {
  id: string;
  user_id: string;
  login_at: string;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  device_type: string | null;
  browser: string | null;
  success: boolean;
}

interface AuthUserInfo {
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  confirmed_at: string | null;
}

interface EmployeeInfo {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_id: string | null;
}

interface UnlinkedUser {
  id: string;
  email: string;
  created_at: string;
}

export const UserAdminTab = ({ employeeId }: UserAdminTabProps) => {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [authUserInfo, setAuthUserInfo] = useState<AuthUserInfo | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Für Konto erstellen/verknüpfen
  const [unlinkedUsers, setUnlinkedUsers] = useState<UnlinkedUser[]>([]);
  const [selectedLinkUserId, setSelectedLinkUserId] = useState<string>('');
  const [newAccountRole, setNewAccountRole] = useState<string>('employee');
  const [sendInvitation, setSendInvitation] = useState(true);

  // Hole die user_id und E-Mail vom Employee
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true);
      const { data: employee } = await supabase
        .from('employees')
        .select('id, email, first_name, last_name, user_id')
        .eq('id', employeeId)
        .single();
      
      if (employee) {
        setEmployeeInfo(employee);
        if (employee.user_id) {
          setUserId(employee.user_id);
        } else {
          // Lade unverknüpfte Benutzer
          await fetchUnlinkedUsers();
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const fetchUnlinkedUsers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-user-management/unlinked-users`,
        {
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnlinkedUsers(data.users || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden unverknüpfter Benutzer:', error);
    }
  };

  // Lade Kontostatus und Login-Historie
  useEffect(() => {
    if (!userId) return;

    const fetchAccountData = async () => {
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error('Nicht authentifiziert');
        }

        const response = await supabase.functions.invoke('secure-user-management', {
          body: null,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`
          }
        });

        // Hole Status über die Edge Function
        const statusResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-user-management/status/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          setAccountStatus(data.status);
          setLoginHistory(data.loginHistory || []);
          setAuthUserInfo(data.authUser);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Kontodaten:', error);
        toast.error('Fehler beim Laden der Kontodaten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [userId]);

  const invokeEdgeFunction = async (endpoint: string, body: any = {}) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.access_token) {
      throw new Error('Nicht authentifiziert');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-user-management/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Ein Fehler ist aufgetreten');
    }
    return data;
  };

  const handleSuspend = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('suspend', { userId, reason: suspendReason });
      toast.success('Benutzerkonto wurde gesperrt');
      setAccountStatus(prev => prev ? { ...prev, is_suspended: true, suspended_at: new Date().toISOString(), suspended_reason: suspendReason } : null);
      setSuspendReason('');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Sperren');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('unsuspend', { userId });
      toast.success('Benutzerkonto wurde entsperrt');
      setAccountStatus(prev => prev ? { ...prev, is_suspended: false, suspended_at: null, suspended_reason: null } : null);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Entsperren');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('reset-password', { userId });
      toast.success('Passwort-Reset-Link wurde gesendet');
      setAccountStatus(prev => prev ? { ...prev, last_password_reset: new Date().toISOString() } : null);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Zurücksetzen');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResendCredentials = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('resend-credentials', { userId });
      toast.success('Zugangsdaten wurden erneut gesendet');
      setAccountStatus(prev => prev ? { ...prev, last_credentials_sent: new Date().toISOString() } : null);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Senden');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTerminateSessions = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('terminate-sessions', { userId });
      toast.success('Alle Sessions wurden beendet');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Beenden der Sessions');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReset2FA = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('reset-2fa', { userId });
      toast.success('2FA wurde zurückgesetzt');
      setAccountStatus(prev => prev ? { ...prev, two_factor_enabled: false, two_factor_reset_at: new Date().toISOString() } : null);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Zurücksetzen der 2FA');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/secure-user-management/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      toast.success('Benutzerkonto wurde gelöscht');
      // Redirect oder Refresh
      window.location.href = '/employees';
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Löschen');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!employeeInfo?.email) {
      toast.error('Mitarbeiter hat keine E-Mail-Adresse');
      return;
    }
    
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('create-account', {
        employeeId,
        email: employeeInfo.email,
        role: newAccountRole,
        sendInvitation
      });
      toast.success('Benutzerkonto wurde erstellt');
      // Reload
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Erstellen');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!selectedLinkUserId) {
      toast.error('Bitte wählen Sie ein Benutzerkonto aus');
      return;
    }
    
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('link-account', {
        employeeId,
        userId: selectedLinkUserId
      });
      toast.success('Benutzerkonto wurde verknüpft');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Verknüpfen');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    setIsActionLoading(true);
    try {
      await invokeEdgeFunction('unlink-account', { employeeId });
      toast.success('Verknüpfung wurde aufgehoben');
      setUserId(null);
      setAccountStatus(null);
      setAuthUserInfo(null);
      setLoginHistory([]);
      await fetchUnlinkedUsers();
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Aufheben');
    } finally {
      setIsActionLoading(false);
    }
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unbekannt', device: 'Unbekannt' };
    
    let browser = 'Unbekannt';
    let device = 'Desktop';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      device = 'Mobil';
    } else if (ua.includes('Tablet') || ua.includes('iPad')) {
      device = 'Tablet';
    }

    return { browser, device };
  };

  // Kein verknüpftes Benutzerkonto - zeige Optionen zum Erstellen/Verknüpfen
  if (!userId && !isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Dieser Mitarbeiter hat kein verknüpftes Benutzerkonto.</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Erstellen Sie ein neues Benutzerkonto oder verknüpfen Sie ein bestehendes Konto, 
              um diesem Mitarbeiter Zugang zum System zu gewähren.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Neues Konto erstellen */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Neues Benutzerkonto erstellen
              </CardTitle>
              <CardDescription>
                Erstellt ein neues Konto mit der E-Mail des Mitarbeiters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-Mail-Adresse</Label>
                <Input 
                  value={employeeInfo?.email || ''} 
                  disabled 
                  className="bg-muted"
                />
                {!employeeInfo?.email && (
                  <p className="text-xs text-destructive">Keine E-Mail-Adresse hinterlegt</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={newAccountRole} onValueChange={setNewAccountRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Mitarbeiter</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sendInvitation" 
                  checked={sendInvitation}
                  onCheckedChange={(checked) => setSendInvitation(checked as boolean)}
                />
                <Label htmlFor="sendInvitation" className="text-sm font-normal">
                  Einladung per E-Mail senden
                </Label>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={handleCreateAccount}
                disabled={isActionLoading || !employeeInfo?.email}
              >
                <UserPlus className="h-4 w-4" />
                Konto erstellen
              </Button>
            </CardContent>
          </Card>

          {/* Bestehendes Konto verknüpfen */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="h-5 w-5" />
                Bestehendes Konto verknüpfen
              </CardTitle>
              <CardDescription>
                Verknüpft ein vorhandenes Benutzerkonto mit diesem Mitarbeiter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Verfügbare Benutzerkonten</Label>
                <Select value={selectedLinkUserId} onValueChange={setSelectedLinkUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Benutzerkonto auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedUsers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Keine unverknüpften Konten verfügbar
                      </SelectItem>
                    ) : (
                      unlinkedUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {unlinkedUsers.length} unverknüpfte Benutzerkonten verfügbar
                </p>
              </div>

              <Button 
                className="w-full gap-2" 
                variant="outline"
                onClick={handleLinkAccount}
                disabled={isActionLoading || !selectedLinkUserId}
              >
                <Link className="h-4 w-4" />
                Konto verknüpfen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isSuspended = accountStatus?.is_suspended || false;
  const isOwnAccount = userId === currentUser?.id;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Kontostatus */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Kontostatus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {isSuspended ? (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Gesperrt
                </Badge>
              ) : (
                <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Aktiv
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Letzter Login</span>
              <span className="text-sm font-medium">
                {authUserInfo?.last_sign_in_at 
                  ? format(new Date(authUserInfo.last_sign_in_at), 'dd.MM.yyyy HH:mm', { locale: de })
                  : 'Nie'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Konto erstellt</span>
              <span className="text-sm font-medium">
                {authUserInfo?.created_at 
                  ? format(new Date(authUserInfo.created_at), 'dd.MM.yyyy', { locale: de })
                  : '-'}
              </span>
            </div>

            {isSuspended && accountStatus?.suspended_reason && (
              <div className="pt-2 border-t">
                <span className="text-sm text-muted-foreground">Sperrgrund:</span>
                <p className="text-sm mt-1">{accountStatus.suspended_reason}</p>
              </div>
            )}

            <Separator />

            {!isOwnAccount && (
              <>
                {isSuspended ? (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleUnsuspend}
                    disabled={isActionLoading}
                  >
                    <ShieldOff className="h-4 w-4" />
                    Konto entsperren
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full gap-2"
                        disabled={isActionLoading}
                      >
                        <Shield className="h-4 w-4" />
                        Konto sperren
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konto sperren</AlertDialogTitle>
                        <AlertDialogDescription>
                          Der Benutzer kann sich nicht mehr anmelden. Alle aktiven Sessions werden beendet.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="suspendReason">Grund für die Sperrung (optional)</Label>
                        <Textarea
                          id="suspendReason"
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          placeholder="z.B. Verstoß gegen Unternehmensrichtlinien"
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSuspend} className="bg-destructive text-destructive-foreground">
                          Konto sperren
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Zugangsdaten */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              Zugangsdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">E-Mail</span>
              <span className="text-sm font-medium">{authUserInfo?.email || '-'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Letzter Passwort-Reset</span>
              <span className="text-sm font-medium">
                {accountStatus?.last_password_reset 
                  ? format(new Date(accountStatus.last_password_reset), 'dd.MM.yyyy HH:mm', { locale: de })
                  : 'Nie'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zugangsdaten gesendet</span>
              <span className="text-sm font-medium">
                {accountStatus?.last_credentials_sent 
                  ? format(new Date(accountStatus.last_credentials_sent), 'dd.MM.yyyy HH:mm', { locale: de })
                  : 'Nie'}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleResetPassword}
                disabled={isActionLoading}
              >
                <RefreshCw className="h-4 w-4" />
                Passwort zurücksetzen
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleResendCredentials}
                disabled={isActionLoading}
              >
                <Mail className="h-4 w-4" />
                Zugangsdaten erneut senden
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verknüpfung */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Link className="h-5 w-5" />
              Kontoverknüpfung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verknüpft mit Mitarbeiter</span>
              <span className="text-sm font-medium">
                {employeeInfo ? `${employeeInfo.first_name} ${employeeInfo.last_name}` : '-'}
              </span>
            </div>

            <Separator />

            {!isOwnAccount && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
                    disabled={isActionLoading}
                  >
                    <Unlink className="h-4 w-4" />
                    Verknüpfung aufheben
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Verknüpfung aufheben?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Das Benutzerkonto bleibt bestehen, wird aber nicht mehr mit diesem Mitarbeiter verknüpft sein.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUnlinkAccount}>
                      Verknüpfung aufheben
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Aktive Sessions
            </CardTitle>
            <CardDescription>
              Beenden Sie alle aktiven Anmeldungen des Benutzers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOwnAccount && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={isActionLoading}
                  >
                    <LogOut className="h-4 w-4" />
                    Alle Sessions beenden
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Alle Sessions beenden?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Der Benutzer wird auf allen Geräten abgemeldet und muss sich erneut anmelden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTerminateSessions}>
                      Sessions beenden
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Zwei-Faktor-Authentifizierung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {accountStatus?.two_factor_enabled ? (
                <Badge className="bg-green-500 hover:bg-green-600">Aktiviert</Badge>
              ) : (
                <Badge variant="secondary">Deaktiviert</Badge>
              )}
            </div>

            {accountStatus?.two_factor_reset_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Letzter Reset</span>
                <span className="text-sm font-medium">
                  {format(new Date(accountStatus.two_factor_reset_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </span>
              </div>
            )}

            <Separator />

            {accountStatus?.two_factor_enabled && !isOwnAccount && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={isActionLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    2FA zurücksetzen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>2FA zurücksetzen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Die Zwei-Faktor-Authentifizierung wird deaktiviert. Der Benutzer muss sie erneut einrichten.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset2FA}>
                      2FA zurücksetzen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Login-Historie */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Login-Historie (letzte 30 Tage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loginHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>IP-Adresse</TableHead>
                  <TableHead>Gerät</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((entry) => {
                  const { browser, device } = parseUserAgent(entry.user_agent);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.login_at), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.login_at), 'HH:mm', { locale: de })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {entry.ip_address || '-'}
                      </TableCell>
                      <TableCell>{entry.device_type || device}</TableCell>
                      <TableCell>{entry.browser || browser}</TableCell>
                      <TableCell>
                        {entry.success ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-200">
                            Erfolgreich
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Fehlgeschlagen
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Login-Historie vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gefahrenzone */}
      {!isOwnAccount && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Gefahrenzone
            </CardTitle>
            <CardDescription>
              Diese Aktionen sind unwiderruflich
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="gap-2"
                  disabled={isActionLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  Benutzerkonto löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Benutzerkonto unwiderruflich löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Das Benutzerkonto und alle zugehörigen Daten werden dauerhaft gelöscht. 
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Unwiderruflich löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};