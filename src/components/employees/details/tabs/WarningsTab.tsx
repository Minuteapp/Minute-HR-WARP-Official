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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, Plus, FileWarning, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface WarningsTabProps {
  employeeId: string;
}

interface Warning {
  id: string;
  warning_type: string;
  severity: string;
  title: string;
  description: string;
  incident_date?: string;
  issued_date: string;
  issued_by_name?: string;
  employee_acknowledged: boolean;
  acknowledged_date?: string;
  appeal_submitted: boolean;
  appeal_notes?: string;
  appeal_outcome?: string;
  status: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
}

const warningTypeLabels: Record<string, string> = {
  verbal: 'Mündliche Ermahnung',
  written: 'Schriftliche Abmahnung',
  final: 'Letzte Abmahnung',
  termination: 'Kündigung',
};

const warningTypeColors: Record<string, string> = {
  verbal: 'bg-yellow-100 text-yellow-800',
  written: 'bg-orange-100 text-orange-800',
  final: 'bg-red-100 text-red-800',
  termination: 'bg-red-200 text-red-900',
};

const severityLabels: Record<string, string> = {
  low: 'Gering',
  medium: 'Mittel',
  high: 'Hoch',
  critical: 'Kritisch',
};

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  expired: 'Abgelaufen',
  revoked: 'Widerrufen',
  appealed: 'Einspruch',
};

const statusColors: Record<string, string> = {
  active: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  revoked: 'bg-green-100 text-green-800',
  appealed: 'bg-blue-100 text-blue-800',
};

export const WarningsTab = ({ employeeId }: WarningsTabProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    warning_type: 'verbal',
    severity: 'medium',
    title: '',
    description: '',
    incident_date: '',
    issued_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: warnings, isLoading } = useQuery({
    queryKey: ['employee-warnings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_warnings')
        .select('*')
        .eq('employee_id', employeeId)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data as Warning[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('employee_warnings').insert({
        employee_id: employeeId,
        ...data,
        issued_by: userData.user?.id,
        issued_by_name: userData.user?.email,
        incident_date: data.incident_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-warnings', employeeId] });
      toast.success('Abmahnung erfasst');
      setIsDialogOpen(false);
      setFormData({
        warning_type: 'verbal',
        severity: 'medium',
        title: '',
        description: '',
        incident_date: '',
        issued_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    },
    onError: () => toast.error('Fehler beim Erfassen'),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_warnings')
        .update({ employee_acknowledged: true, acknowledged_date: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-warnings', employeeId] });
      toast.success('Kenntnisnahme erfasst');
    },
  });

  const activeWarnings = warnings?.filter(w => w.status === 'active') || [];
  const inactiveWarnings = warnings?.filter(w => w.status !== 'active') || [];

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <strong>Vertraulich:</strong> Diese Informationen sind nur für HR-Personal und Führungskräfte zugänglich.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Abmahnungen & Verwarnungen</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" className="gap-2">
              <Plus className="w-4 h-4" />
              Abmahnung erfassen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neue Abmahnung erfassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Art der Abmahnung</Label>
                  <Select value={formData.warning_type} onValueChange={(v) => setFormData(p => ({ ...p, warning_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(warningTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schweregrad</Label>
                  <Select value={formData.severity} onValueChange={(v) => setFormData(p => ({ ...p, severity: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Betreff *</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="z.B. Wiederholtes Zuspätkommen" />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Detaillierte Beschreibung des Vorfalls..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum des Vorfalls</Label>
                  <Input type="date" value={formData.incident_date} onChange={(e) => setFormData(p => ({ ...p, incident_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Ausstellungsdatum *</Label>
                  <Input type="date" value={formData.issued_date} onChange={(e) => setFormData(p => ({ ...p, issued_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interne Notizen</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" variant="destructive" onClick={() => addMutation.mutate(formData)} disabled={!formData.title || !formData.description || !formData.issued_date}>
                Abmahnung erfassen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktive Abmahnungen */}
      <Card className={activeWarnings.length > 0 ? 'border-red-200' : ''}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${activeWarnings.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
            Aktive Abmahnungen ({activeWarnings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeWarnings.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Keine aktiven Abmahnungen</span>
            </div>
          ) : (
            <div className="space-y-4">
              {activeWarnings.map((warning) => (
                <div key={warning.id} className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileWarning className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{warning.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={warningTypeColors[warning.warning_type]}>{warningTypeLabels[warning.warning_type]}</Badge>
                      <Badge className={severityColors[warning.severity]}>{severityLabels[warning.severity]}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{warning.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>Ausgestellt: {format(new Date(warning.issued_date), 'dd.MM.yyyy', { locale: de })}</span>
                      {warning.issued_by_name && <span>Von: {warning.issued_by_name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {warning.employee_acknowledged ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Kenntnisnahme bestätigt
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => acknowledgeMutation.mutate(warning.id)}>
                          <Clock className="w-4 h-4 mr-1" />
                          Kenntnisnahme erfassen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historische Abmahnungen */}
      {inactiveWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Historie ({inactiveWarnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveWarnings.map((warning) => (
                <div key={warning.id} className="p-3 border rounded-lg opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{warning.title}</span>
                      <Badge className={warningTypeColors[warning.warning_type]} variant="secondary">
                        {warningTypeLabels[warning.warning_type]}
                      </Badge>
                      <Badge className={statusColors[warning.status]}>{statusLabels[warning.status]}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(warning.issued_date), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
