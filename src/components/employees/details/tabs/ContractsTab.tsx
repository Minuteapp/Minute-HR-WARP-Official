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
import { FileSignature, Plus, FileText, Clock, Euro, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ContractsTabProps {
  employeeId: string;
}

interface Contract {
  id: string;
  contract_type: string;
  contract_title: string;
  start_date: string;
  end_date?: string;
  is_unlimited: boolean;
  working_hours_per_week?: number;
  salary_amount?: number;
  salary_currency: string;
  probation_period_months?: number;
  notice_period_weeks?: number;
  signed_date?: string;
  signed_by_employee: boolean;
  signed_by_employer: boolean;
  notes?: string;
  created_at: string;
}

const contractTypeLabels: Record<string, string> = {
  initial: 'Erstvertrag',
  amendment: 'Nachtrag',
  extension: 'Verlängerung',
  termination: 'Aufhebung',
};

const contractTypeColors: Record<string, string> = {
  initial: 'bg-blue-100 text-blue-800',
  amendment: 'bg-purple-100 text-purple-800',
  extension: 'bg-green-100 text-green-800',
  termination: 'bg-red-100 text-red-800',
};

export const ContractsTab = ({ employeeId }: ContractsTabProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    contract_type: 'initial',
    contract_title: '',
    start_date: '',
    end_date: '',
    is_unlimited: true,
    working_hours_per_week: 40,
    salary_amount: 0,
    probation_period_months: 6,
    notice_period_weeks: 4,
    notes: '',
  });

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as Contract[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('employee_contracts').insert({
        employee_id: employeeId,
        ...data,
        salary_currency: 'EUR',
        end_date: data.is_unlimited ? null : data.end_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts', employeeId] });
      toast.success('Vertrag hinzugefügt');
      setIsDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Hinzufügen'),
  });

  const currentContract = contracts?.find(c => {
    const now = new Date();
    const start = new Date(c.start_date);
    const end = c.end_date ? new Date(c.end_date) : null;
    return start <= now && (!end || end >= now);
  });

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Arbeitsverträge</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Vertrag hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neuen Vertrag erfassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vertragsart</Label>
                  <Select value={formData.contract_type} onValueChange={(v) => setFormData(p => ({ ...p, contract_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(contractTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Titel</Label>
                  <Input value={formData.contract_title} onChange={(e) => setFormData(p => ({ ...p, contract_title: e.target.value }))} placeholder="z.B. Arbeitsvertrag 2024" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Startdatum *</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Enddatum</Label>
                  <Input type="date" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} disabled={formData.is_unlimited} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_unlimited} onCheckedChange={(v) => setFormData(p => ({ ...p, is_unlimited: v }))} />
                <Label>Unbefristeter Vertrag</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Wochenstunden</Label>
                  <Input type="number" value={formData.working_hours_per_week} onChange={(e) => setFormData(p => ({ ...p, working_hours_per_week: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Bruttogehalt (€)</Label>
                  <Input type="number" value={formData.salary_amount} onChange={(e) => setFormData(p => ({ ...p, salary_amount: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Probezeit (Monate)</Label>
                  <Input type="number" value={formData.probation_period_months} onChange={(e) => setFormData(p => ({ ...p, probation_period_months: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Kündigungsfrist (Wochen)</Label>
                  <Input type="number" value={formData.notice_period_weeks} onChange={(e) => setFormData(p => ({ ...p, notice_period_weeks: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notizen</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => addMutation.mutate(formData)} disabled={!formData.start_date || !formData.contract_title}>
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktueller Vertrag */}
      {currentContract && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-primary" />
              Aktueller Vertrag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={contractTypeColors[currentContract.contract_type]}>
                    {contractTypeLabels[currentContract.contract_type]}
                  </Badge>
                  {currentContract.is_unlimited && (
                    <Badge variant="outline">Unbefristet</Badge>
                  )}
                </div>
                <h4 className="font-medium">{currentContract.contract_title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Gültig ab: {format(new Date(currentContract.start_date), 'dd.MM.yyyy', { locale: de })}
                  {currentContract.end_date && ` bis ${format(new Date(currentContract.end_date), 'dd.MM.yyyy', { locale: de })}`}
                </p>
              </div>
              <div className="text-right text-sm">
                {currentContract.working_hours_per_week && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {currentContract.working_hours_per_week}h/Woche
                  </div>
                )}
                {currentContract.salary_amount && (
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <Euro className="w-4 h-4" />
                    {currentContract.salary_amount.toLocaleString('de-DE')} €/Monat
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`w-4 h-4 ${currentContract.signed_by_employee ? 'text-green-600' : 'text-muted-foreground'}`} />
                Mitarbeiter
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`w-4 h-4 ${currentContract.signed_by_employer ? 'text-green-600' : 'text-muted-foreground'}`} />
                Arbeitgeber
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vertragshistorie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vertragshistorie</CardTitle>
        </CardHeader>
        <CardContent>
          {!contracts?.length ? (
            <p className="text-muted-foreground text-sm">Keine Verträge vorhanden</p>
          ) : (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {contracts.map((contract, index) => (
                  <div key={contract.id} className="relative pl-10">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="p-3 border rounded-lg bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{contract.contract_title}</span>
                          <Badge className={contractTypeColors[contract.contract_type]} variant="secondary">
                            {contractTypeLabels[contract.contract_type]}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(contract.start_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                      </div>
                      {contract.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{contract.notes}</p>
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
