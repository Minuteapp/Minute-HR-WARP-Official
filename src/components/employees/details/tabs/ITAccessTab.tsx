import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  KeyRound, Plus, Mail, Server, Globe, Shield, 
  Lock, Unlock, CheckCircle, XCircle, Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ITAccessTabProps {
  employeeId: string;
}

interface ITAccess {
  id: string;
  system_name: string;
  system_type?: string;
  username?: string;
  access_level?: string;
  granted_date?: string;
  revoked_date?: string;
  revoke_reason?: string;
  last_login?: string;
  status: string;
  requires_2fa: boolean;
  notes?: string;
}

const systemTypeIcons: Record<string, any> = {
  email: Mail,
  erp: Server,
  crm: Server,
  vpn: Shield,
  cloud: Globe,
  internal: Server,
  external: Globe,
};

const systemTypeLabels: Record<string, string> = {
  email: 'E-Mail',
  erp: 'ERP-System',
  crm: 'CRM',
  vpn: 'VPN',
  cloud: 'Cloud-Dienst',
  internal: 'Internes System',
  external: 'Externes System',
};

const accessLevelLabels: Record<string, string> = {
  read: 'Nur Lesen',
  write: 'Lesen & Schreiben',
  admin: 'Administrator',
  custom: 'Benutzerdefiniert',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  revoked: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  suspended: 'Gesperrt',
  revoked: 'Entzogen',
  pending: 'Ausstehend',
};

export const ITAccessTab = ({ employeeId }: ITAccessTabProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    system_name: '',
    system_type: 'internal',
    username: '',
    access_level: 'read',
    requires_2fa: false,
    notes: '',
  });

  const { data: accesses, isLoading } = useQuery({
    queryKey: ['employee-it-access', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_it_access')
        .select('*')
        .eq('employee_id', employeeId)
        .order('granted_date', { ascending: false });
      
      if (error) throw error;
      return data as ITAccess[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('employee_it_access').insert({
        employee_id: employeeId,
        ...data,
        granted_date: new Date().toISOString().split('T')[0],
        granted_by: userData.user?.id,
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-it-access', employeeId] });
      toast.success('Zugang hinzugefügt');
      setIsDialogOpen(false);
      setFormData({
        system_name: '',
        system_type: 'internal',
        username: '',
        access_level: 'read',
        requires_2fa: false,
        notes: '',
      });
    },
    onError: () => toast.error('Fehler beim Hinzufügen'),
  });

  const revokeMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('employee_it_access')
        .update({ 
          status: 'revoked', 
          revoked_date: new Date().toISOString().split('T')[0],
          revoked_by: userData.user?.id,
          revoke_reason: reason || 'Manuell entzogen'
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-it-access', employeeId] });
      toast.success('Zugang entzogen');
    },
  });

  const activeAccesses = accesses?.filter(a => a.status === 'active') || [];
  const inactiveAccesses = accesses?.filter(a => a.status !== 'active') || [];

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">IT-Zugangsrechte</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Zugang hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen IT-Zugang einrichten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Systemtyp</Label>
                  <Select value={formData.system_type} onValueChange={(v) => setFormData(p => ({ ...p, system_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(systemTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zugangslevel</Label>
                  <Select value={formData.access_level} onValueChange={(v) => setFormData(p => ({ ...p, access_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(accessLevelLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Systemname *</Label>
                <Input value={formData.system_name} onChange={(e) => setFormData(p => ({ ...p, system_name: e.target.value }))} placeholder="z.B. Microsoft 365, SAP, Jira" />
              </div>
              <div className="space-y-2">
                <Label>Benutzername</Label>
                <Input value={formData.username} onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))} placeholder="z.B. m.mustermann" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.requires_2fa} onCheckedChange={(v) => setFormData(p => ({ ...p, requires_2fa: v }))} />
                <Label>2-Faktor-Authentifizierung erforderlich</Label>
              </div>
              <div className="space-y-2">
                <Label>Notizen</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => addMutation.mutate(formData)} disabled={!formData.system_name}>
                Zugang einrichten
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktive Zugänge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Unlock className="w-4 h-4 text-green-600" />
            Aktive Zugänge ({activeAccesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAccesses.length === 0 ? (
            <p className="text-muted-foreground text-sm">Keine aktiven Zugänge</p>
          ) : (
            <div className="space-y-3">
              {activeAccesses.map((access) => {
                const Icon = systemTypeIcons[access.system_type || 'internal'] || Server;
                return (
                  <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{access.system_name}</p>
                          {access.requires_2fa && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              2FA
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {access.username && `@${access.username} • `}
                          {systemTypeLabels[access.system_type || 'internal']}
                        </p>
                        {access.last_login && (
                          <p className="text-xs text-muted-foreground">
                            Letzter Login: {format(new Date(access.last_login), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{accessLevelLabels[access.access_level || 'read']}</Badge>
                      <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate({ id: access.id })}>
                        <Lock className="w-4 h-4 mr-1" />
                        Sperren
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gesperrte / Entzogene Zugänge */}
      {inactiveAccesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Inaktive Zugänge ({inactiveAccesses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveAccesses.map((access) => {
                const Icon = systemTypeIcons[access.system_type || 'internal'] || Server;
                return (
                  <div key={access.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{access.system_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {access.username && `@${access.username}`}
                        </p>
                        {access.revoked_date && (
                          <p className="text-xs text-muted-foreground">
                            Entzogen am: {format(new Date(access.revoked_date), 'dd.MM.yyyy', { locale: de })}
                            {access.revoke_reason && ` - ${access.revoke_reason}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[access.status]}>{statusLabels[access.status]}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistik */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{activeAccesses.length}</p>
              <p className="text-sm text-muted-foreground">Aktive Zugänge</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{activeAccesses.filter(a => a.requires_2fa).length}</p>
              <p className="text-sm text-muted-foreground">Mit 2FA</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{activeAccesses.filter(a => a.access_level === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Admin-Rechte</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-muted-foreground">{inactiveAccesses.length}</p>
              <p className="text-sm text-muted-foreground">Entzogen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
