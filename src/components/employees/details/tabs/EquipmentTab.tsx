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
import { 
  Laptop, Smartphone, Key, CreditCard, Monitor, Headphones, 
  Package, Plus, RotateCcw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EquipmentTabProps {
  employeeId: string;
}

interface Equipment {
  id: string;
  equipment_type: string;
  name: string;
  serial_number?: string;
  asset_tag?: string;
  manufacturer?: string;
  model?: string;
  purchase_date?: string;
  warranty_until?: string;
  condition: string;
  status: string;
  assigned_date?: string;
  returned_date?: string;
  notes?: string;
}

const equipmentTypeIcons: Record<string, any> = {
  laptop: Laptop,
  phone: Smartphone,
  key: Key,
  access_card: CreditCard,
  monitor: Monitor,
  headset: Headphones,
  other: Package,
};

const equipmentTypeLabels: Record<string, string> = {
  laptop: 'Laptop',
  phone: 'Smartphone',
  key: 'Schlüssel',
  access_card: 'Zugangskarte',
  monitor: 'Monitor',
  headset: 'Headset',
  other: 'Sonstiges',
};

const statusColors: Record<string, string> = {
  assigned: 'bg-green-100 text-green-800',
  returned: 'bg-gray-100 text-gray-800',
  lost: 'bg-red-100 text-red-800',
  damaged: 'bg-orange-100 text-orange-800',
};

const statusLabels: Record<string, string> = {
  assigned: 'Zugewiesen',
  returned: 'Zurückgegeben',
  lost: 'Verloren',
  damaged: 'Beschädigt',
};

const conditionLabels: Record<string, string> = {
  new: 'Neu',
  good: 'Gut',
  fair: 'Befriedigend',
  poor: 'Schlecht',
};

export const EquipmentTab = ({ employeeId }: EquipmentTabProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipment_type: 'laptop',
    name: '',
    serial_number: '',
    asset_tag: '',
    manufacturer: '',
    model: '',
    condition: 'good',
    notes: '',
  });

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['employee-equipment', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_equipment')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assigned_date', { ascending: false });
      
      if (error) throw error;
      return data as Equipment[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('employee_equipment').insert({
        employee_id: employeeId,
        ...data,
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'assigned',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-equipment', employeeId] });
      toast.success('Arbeitsmittel hinzugefügt');
      setIsDialogOpen(false);
      setFormData({
        equipment_type: 'laptop',
        name: '',
        serial_number: '',
        asset_tag: '',
        manufacturer: '',
        model: '',
        condition: 'good',
        notes: '',
      });
    },
    onError: () => toast.error('Fehler beim Hinzufügen'),
  });

  const returnMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_equipment')
        .update({ status: 'returned', returned_date: new Date().toISOString().split('T')[0] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-equipment', employeeId] });
      toast.success('Rückgabe erfasst');
    },
  });

  const activeEquipment = equipment?.filter(e => e.status === 'assigned') || [];
  const returnedEquipment = equipment?.filter(e => e.status !== 'assigned') || [];

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Arbeitsmittel</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Arbeitsmittel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select value={formData.equipment_type} onValueChange={(v) => setFormData(p => ({ ...p, equipment_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(equipmentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zustand</Label>
                  <Select value={formData.condition} onValueChange={(v) => setFormData(p => ({ ...p, condition: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bezeichnung *</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hersteller</Label>
                  <Input value={formData.manufacturer} onChange={(e) => setFormData(p => ({ ...p, manufacturer: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Modell</Label>
                  <Input value={formData.model} onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seriennummer</Label>
                  <Input value={formData.serial_number} onChange={(e) => setFormData(p => ({ ...p, serial_number: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Asset-Tag</Label>
                  <Input value={formData.asset_tag} onChange={(e) => setFormData(p => ({ ...p, asset_tag: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notizen</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => addMutation.mutate(formData)} disabled={!formData.name}>
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aktive Arbeitsmittel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Aktuelle Ausstattung ({activeEquipment.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeEquipment.length === 0 ? (
            <p className="text-muted-foreground text-sm">Keine Arbeitsmittel zugewiesen</p>
          ) : (
            <div className="space-y-3">
              {activeEquipment.map((item) => {
                const Icon = equipmentTypeIcons[item.equipment_type] || Package;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.manufacturer} {item.model} {item.serial_number && `• SN: ${item.serial_number}`}
                        </p>
                        {item.assigned_date && (
                          <p className="text-xs text-muted-foreground">
                            Zugewiesen: {format(new Date(item.assigned_date), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{conditionLabels[item.condition] || item.condition}</Badge>
                      <Button size="sm" variant="outline" onClick={() => returnMutation.mutate(item.id)}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Rückgabe
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zurückgegebene / Sonstige */}
      {returnedEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Historie ({returnedEquipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returnedEquipment.map((item) => {
                const Icon = equipmentTypeIcons[item.equipment_type] || Package;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.manufacturer} {item.model}
                        </p>
                        {item.returned_date && (
                          <p className="text-xs text-muted-foreground">
                            Zurückgegeben: {format(new Date(item.returned_date), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
