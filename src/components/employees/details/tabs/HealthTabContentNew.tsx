import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Activity, Plus, Heart, AlertTriangle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HealthTabContentNewProps {
  employeeId: string;
}

export const HealthTabContentNew: React.FC<HealthTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    notes: '',
    followUp: ''
  });

  const handleCreate = () => {
    setRecords([...records, { id: Date.now(), ...formData }]);
    setDialogOpen(false);
    setFormData({ type: '', date: '', notes: '', followUp: '' });
  };

  const recordTypes = [
    { value: 'checkup', label: 'Vorsorgeuntersuchung' },
    { value: 'vaccination', label: 'Impfung' },
    { value: 'ergonomics', label: 'Ergonomie-Check' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'other', label: 'Sonstiges' }
  ];

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'checkup': return <Heart className="h-4 w-4 text-red-500" />;
      case 'vaccination': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'mental_health': return <Heart className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Gesundheit
        </h2>
        {canCreate('employee_health') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{records.length}</p>
              <p className="text-xs text-muted-foreground">Einträge gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {records.filter(r => r.type === 'checkup').length}
              </p>
              <p className="text-xs text-muted-foreground">Vorsorgeuntersuchungen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.followUp).length}
              </p>
              <p className="text-xs text-muted-foreground">Offene Follow-ups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gesundheitseinträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getTypeIcon(record.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {recordTypes.find(t => t.value === record.type)?.label || record.type}
                      </span>
                      <Badge variant="outline">
                        {new Date(record.date).toLocaleDateString('de-DE')}
                      </Badge>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                    )}
                    {record.followUp && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                        <AlertTriangle className="h-3 w-3" />
                        Follow-up: {record.followUp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Gesundheitseinträge vorhanden</p>
              {canCreate('employee_health') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Eintrag hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gesundheitseintrag hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Art des Eintrags</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Datum</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <Label>Notizen</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Optionale Notizen..."
              />
            </div>
            <div>
              <Label>Follow-up Datum (optional)</Label>
              <Input 
                type="date"
                value={formData.followUp}
                onChange={(e) => setFormData({...formData, followUp: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
