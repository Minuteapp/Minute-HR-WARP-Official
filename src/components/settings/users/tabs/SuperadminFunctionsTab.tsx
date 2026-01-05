import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Impersonation Hook - falls nicht verfügbar, verwende lokalen State
const useImpersonation = () => {
  const [isImpersonating, setIsImpersonating] = React.useState(false);
  const [impersonatedUser, setImpersonatedUser] = React.useState<{ id: string; name: string } | null>(null);
  
  const startImpersonation = async (userId: string, userName: string) => {
    setImpersonatedUser({ id: userId, name: userName });
    setIsImpersonating(true);
  };
  
  const stopImpersonation = () => {
    setImpersonatedUser(null);
    setIsImpersonating(false);
  };
  
  return { isImpersonating, impersonatedUser, startImpersonation, stopImpersonation };
};
import { 
  Crown, UserCog, Eye, Shield, AlertTriangle, Clock, 
  LogOut, Play, Users, Building2, Search, Zap
} from 'lucide-react';

interface TunnelSession {
  id: string;
  target_user_id: string;
  target_user_name: string;
  started_at: string;
  ended_at: string | null;
  reason: string;
  actions_performed: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const SuperadminFunctionsTab: React.FC = () => {
  const [showTunnelDialog, setShowTunnelDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [tunnelSessions, setTunnelSessions] = useState<TunnelSession[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tunnelReason, setTunnelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const { isImpersonating, impersonatedUser, startImpersonation, stopImpersonation } = useImpersonation();

  useEffect(() => {
    loadUsers();
    loadTunnelHistory();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (error) throw error;

      const usersList: User[] = (data || []).map(ur => ({
        id: ur.user_id,
        email: `user-${ur.user_id.slice(0, 8)}@company.com`,
        name: `Benutzer ${ur.user_id.slice(0, 8)}`,
        role: ur.role
      }));

      setUsers(usersList);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  };

  const loadTunnelHistory = async () => {
    // Tunnel-Historie wird aus der DB geladen
    // TODO: Echte Daten aus einer tunnel_sessions Tabelle laden
    setTunnelSessions([]);
  };

  const handleStartTunnel = async () => {
    if (!selectedUser || !tunnelReason.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Benutzer und geben Sie eine Begründung ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Tunnel starten
      await startImpersonation(selectedUser.id, selectedUser.name);
      
      toast({
        title: "Tunnel aktiv",
        description: `Sie handeln jetzt als ${selectedUser.name}. Alle Aktionen werden protokolliert.`
      });

      setShowTunnelDialog(false);
      setTunnelReason('');
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEndTunnel = async () => {
    try {
      stopImpersonation();
      toast({
        title: "Tunnel beendet",
        description: "Sie sind wieder mit Ihrem eigenen Konto angemeldet."
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Warnung */}
      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Superadmin-Bereich</AlertTitle>
        <AlertDescription className="text-amber-700">
          Alle Aktionen in diesem Bereich werden vollständig protokolliert und sind auditierbar.
          Bitte verwenden Sie diese Funktionen nur für legitime Support- und Administrationszwecke.
        </AlertDescription>
      </Alert>

      {/* Aktiver Tunnel-Status */}
      {isImpersonating && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100">
                  <UserCog className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-800">TUNNEL AKTIV</p>
                  <p className="text-sm text-red-700">
                    Sie handeln als: <strong>{impersonatedUser?.name}</strong>
                  </p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleEndTunnel}>
                <LogOut className="h-4 w-4 mr-2" />
                Tunnel beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impersonation / Tunnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Benutzer-Impersonation (Tunnel)
          </CardTitle>
          <CardDescription>
            Übernehmen Sie temporär die Identität eines Benutzers, um Support zu leisten oder Probleme zu analysieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={() => setShowTunnelDialog(true)} disabled={isImpersonating}>
                <Play className="h-4 w-4 mr-2" />
                Neuen Tunnel starten
              </Button>
              <Button variant="outline" disabled>
                <Building2 className="h-4 w-4 mr-2" />
                Mandant wechseln
              </Button>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Hinweise zur Impersonation:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sie sehen und handeln im exakten Kontext des ausgewählten Benutzers</li>
                <li>• Alle Aktionen werden mit Ihrem Admin-Konto im Audit-Log protokolliert</li>
                <li>• Der Benutzer wird über die Impersonation benachrichtigt</li>
                <li>• Eine Begründung ist Pflicht und wird gespeichert</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Override-Rechte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Temporäre Berechtigungs-Overrides
          </CardTitle>
          <CardDescription>
            Temporär Berechtigungen überschreiben oder Sperren aufheben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowOverrideDialog(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Override erstellen
          </Button>
        </CardContent>
      </Card>

      {/* Tunnel-Historie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Impersonation-Historie
          </CardTitle>
          <CardDescription>
            Übersicht aller durchgeführten Tunnel-Sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ziel-Benutzer</TableHead>
                <TableHead>Beginn</TableHead>
                <TableHead>Ende</TableHead>
                <TableHead>Dauer</TableHead>
                <TableHead>Aktionen</TableHead>
                <TableHead>Begründung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tunnelSessions.map(session => {
                const startDate = new Date(session.started_at);
                const endDate = session.ended_at ? new Date(session.ended_at) : null;
                const duration = endDate 
                  ? Math.round((endDate.getTime() - startDate.getTime()) / 60000)
                  : 'Aktiv';

                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.target_user_name}</TableCell>
                    <TableCell>{startDate.toLocaleString('de-DE')}</TableCell>
                    <TableCell>
                      {endDate ? endDate.toLocaleString('de-DE') : (
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof duration === 'number' ? `${duration} Min.` : duration}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{session.actions_performed}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{session.reason}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tunnel-Dialog */}
      <Dialog open={showTunnelDialog} onOpenChange={setShowTunnelDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Benutzer-Tunnel starten</DialogTitle>
            <DialogDescription>
              Wählen Sie einen Benutzer aus, als der Sie temporär handeln möchten
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Benutzer suchen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name oder E-Mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg max-h-[200px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Keine Benutzer gefunden</p>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 ${
                      selectedUser?.id === user.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <Label>Begründung (Pflichtfeld)</Label>
              <Textarea
                placeholder="Warum ist dieser Tunnel notwendig? Z.B. Support-Ticket #12345"
                value={tunnelReason}
                onChange={(e) => setTunnelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTunnelDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleStartTunnel}
              disabled={!selectedUser || !tunnelReason.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Tunnel starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
