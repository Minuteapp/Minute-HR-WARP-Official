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
import { toast } from 'sonner';
import { Users, Plus, Building2, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TeamHistoryTabProps {
  employeeId: string;
}

interface TeamHistoryEntry {
  id: string;
  team_name: string;
  department_name?: string;
  position_title?: string;
  manager_name?: string;
  start_date: string;
  end_date?: string;
  reason_for_change?: string;
  notes?: string;
  created_at: string;
}

const reasonLabels: Record<string, string> = {
  new_hire: 'Neueinstellung',
  promotion: 'Beförderung',
  lateral_move: 'Versetzung',
  reorganization: 'Umstrukturierung',
  request: 'Auf Wunsch',
  other: 'Sonstiges',
};

const reasonColors: Record<string, string> = {
  new_hire: 'bg-blue-100 text-blue-800',
  promotion: 'bg-green-100 text-green-800',
  lateral_move: 'bg-purple-100 text-purple-800',
  reorganization: 'bg-orange-100 text-orange-800',
  request: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

export const TeamHistoryTab = ({ employeeId }: TeamHistoryTabProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    department_name: '',
    position_title: '',
    manager_name: '',
    start_date: '',
    end_date: '',
    reason_for_change: 'lateral_move',
    notes: '',
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ['employee-team-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_team_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as TeamHistoryEntry[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('employee_team_history').insert({
        employee_id: employeeId,
        ...data,
        end_date: data.end_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-team-history', employeeId] });
      toast.success('Eintrag hinzugefügt');
      setIsDialogOpen(false);
      setFormData({
        team_name: '',
        department_name: '',
        position_title: '',
        manager_name: '',
        start_date: '',
        end_date: '',
        reason_for_change: 'lateral_move',
        notes: '',
      });
    },
    onError: () => toast.error('Fehler beim Hinzufügen'),
  });

  const currentPosition = history?.[0];

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team-Historie</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Eintrag hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Team-Eintrag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team *</Label>
                <Input value={formData.team_name} onChange={(e) => setFormData(p => ({ ...p, team_name: e.target.value }))} placeholder="z.B. Frontend-Team" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Abteilung</Label>
                  <Input value={formData.department_name} onChange={(e) => setFormData(p => ({ ...p, department_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={formData.position_title} onChange={(e) => setFormData(p => ({ ...p, position_title: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vorgesetzter</Label>
                <Input value={formData.manager_name} onChange={(e) => setFormData(p => ({ ...p, manager_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Von *</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bis</Label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Grund</Label>
                <Select value={formData.reason_for_change} onValueChange={(v) => setFormData(p => ({ ...p, reason_for_change: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(reasonLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notizen</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => addMutation.mutate(formData)} disabled={!formData.team_name || !formData.start_date}>
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktuelle Position */}
      {currentPosition && !currentPosition.end_date && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Aktuelle Zuordnung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  Team
                </div>
                <p className="font-medium">{currentPosition.team_name}</p>
              </div>
              {currentPosition.department_name && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="w-4 h-4" />
                    Abteilung
                  </div>
                  <p className="font-medium">{currentPosition.department_name}</p>
                </div>
              )}
              {currentPosition.position_title && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase className="w-4 h-4" />
                    Position
                  </div>
                  <p className="font-medium">{currentPosition.position_title}</p>
                </div>
              )}
              {currentPosition.manager_name && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Vorgesetzter
                  </div>
                  <p className="font-medium">{currentPosition.manager_name}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Seit {format(new Date(currentPosition.start_date), 'dd.MM.yyyy', { locale: de })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          {!history?.length ? (
            <p className="text-muted-foreground text-sm">Keine Historie vorhanden</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div key={entry.id} className="relative pl-10">
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${index === 0 && !entry.end_date ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <div className="p-3 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.team_name}</span>
                          {entry.reason_for_change && (
                            <Badge className={reasonColors[entry.reason_for_change]} variant="secondary">
                              {reasonLabels[entry.reason_for_change] || entry.reason_for_change}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {entry.department_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {entry.department_name}
                          </span>
                        )}
                        {entry.position_title && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {entry.position_title}
                          </span>
                        )}
                        {entry.manager_name && (
                          <span>Vorgesetzter: {entry.manager_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {format(new Date(entry.start_date), 'dd.MM.yyyy', { locale: de })}
                        {entry.end_date && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            {format(new Date(entry.end_date), 'dd.MM.yyyy', { locale: de })}
                          </>
                        )}
                        {!entry.end_date && <Badge variant="outline" className="ml-2">Aktuell</Badge>}
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
